package com.example.damiProd.service;

import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Duration;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
public class PhotoService {

    private static final Logger log = LoggerFactory.getLogger(PhotoService.class);

    /**
     * What callers are allowed to upload.
     *
     * <p>There is one upload endpoint left - task photos. It used to be two:
     * the client ID photo upload was removed with the rest of ID storage
     * (TODO-14), and this set stays here rather than moving onto
     * {@code TaskController} because the reason it was centralised still holds.
     * When the list was duplicated across the two endpoints, adding a format to
     * one silently left the other rejecting it.
     */
    public static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp",
            "image/heic",
            "image/heif");

    @Value("${gcs.bucket}")
    private String bucketName;

    private Storage storage;

    /**
     * How long a presigned photo URL stays valid.
     *
     * <p>An hour: long enough to open a task, look through its photos and come
     * back, short enough that a leaked link is stale before it is useful. It is
     * not a security boundary on its own - the boundary is
     * {@code requireCanAccessTask} on the endpoint that hands these out.
     */
    private static final Duration PRESIGNED_URL_TTL = Duration.ofHours(1);

    /** Prefix of the canonical, unsigned URL stored in {@code task_photos.image_url}. */
    private static final String PUBLIC_URL_BASE = "https://storage.googleapis.com/";

    /**
     * Built lazily, and that is load-bearing rather than tidy.
     *
     * <p>This is a {@code @Service}, so it is constructed in every
     * {@code @SpringBootTest} context and on every developer's machine.
     * {@link StorageOptions#getDefaultInstance()} resolves Application Default
     * Credentials, which do not exist in either place - doing it in the
     * constructor would fail the whole context for a bean most tests never call.
     */
    private Storage getStorage() {
        if (storage == null) {
            // No key, anywhere. On Cloud Run ADC resolves to the runtime service
            // account, which holds objectAdmin on this one bucket and nothing
            // else - which is the entire reason the Spaces access key pair could
            // be deleted (TODO-79).
            storage = StorageOptions.getDefaultInstance().getService();
        }
        return storage;
    }

    /**
     * Uploads a file to a specific folder with a custom filename.
     *
     * @param file           The MultipartFile to upload.
     * @param folder         The folder path.
     * @param customFileName The desired filename (without extension). Can be null.
     * @return The canonical (unsigned) URL of the uploaded object.
     * @throws IOException If an I/O error occurs.
     */
    public String uploadPhoto(MultipartFile file, String folder, String customFileName) throws IOException {
        String originalFileName = file.getOriginalFilename();
        if (originalFileName == null) {
            originalFileName = "unknown.jpg";
        }

        // Extract file extension
        String extension = "";
        int i = originalFileName.lastIndexOf('.');
        if (i > 0) {
            extension = originalFileName.substring(i);
        }

        // Build filename
        String fileName;
        if (customFileName != null && !customFileName.isEmpty()) {
            // Sanitize custom filename
            fileName = customFileName.replaceAll("[^a-zA-Z0-9.-]", "_") + extension;
        } else {
            // Default logic: Timestamp + UUID
            fileName = System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 8) + "_"
                    + originalFileName.replaceAll("\\s+", "_");
        }

        // Prepend folder if provided
        String objectName = fileName;
        if (folder != null && !folder.isEmpty()) {
            if (!folder.endsWith("/")) {
                folder += "/";
            }
            objectName = folder + fileName;
        }

        // No ACL is set, and none can be: the bucket has uniform bucket-level
        // access, so per-object ACLs are refused outright and access is decided
        // by the bucket's IAM policy alone. That is a stronger form of what
        // TODO-46 asked for than the PRIVATE canned ACL it replaces - an object
        // cannot be made public by accident, because the API to do it per-object
        // is switched off. It matters here: the key is
        // "poze cabine/{taskId}_{clientName}/{n}" - a small integer, a customer's
        // name and a counter starting at 1 - so one working URL would let anyone
        // walk that client's other photos. Reads go through presignedUrl() below.
        BlobInfo blobInfo = BlobInfo.newBuilder(BlobId.of(bucketName, objectName))
                .setContentType(file.getContentType())
                .build();

        try (var in = file.getInputStream()) {
            getStorage().createFrom(blobInfo, in);
        }

        // The canonical URL is still what gets stored: it is a stable identity
        // for the object, and extractObjectName() turns it back into a key. It
        // is not *usable* on its own - fetching needs a presigned URL.
        return PUBLIC_URL_BASE + bucketName + "/" + objectName;
    }

    /**
     * Deletes a photo from the bucket given its full URL or object name.
     *
     * <p><b>A failure is reported, not thrown</b> (TODO-25). Every caller but one
     * is a cascade whose actual job is removing a row — deleting a client, or a
     * client's orders and their task photos. Throwing from here would abort such
     * a delete halfway, after some objects are already gone, leaving a partially
     * deleted client that the operator has no way to finish. The row going and
     * the object staying is recoverable; a half-deleted cascade is not.
     *
     * <p>What was actually broken was the trace: the failure went to stderr with
     * only {@code e.getMessage()}, so it missed the log format, the level and
     * anything shipping logs off the VPS, and it did not even name the object.
     * Once the owning row is deleted the object key exists nowhere else, so this
     * ERROR line is the only remaining way to find what was left behind. It has
     * to carry the key and the cause.
     *
     * @param photoUrlOrName The full URL or just the object name.
     * @return true if the object was deleted; false if it was left in storage.
     */
    public boolean deletePhoto(String photoUrlOrName) {
        String objectName = extractObjectName(photoUrlOrName);

        try {
            if (getStorage().delete(BlobId.of(bucketName, objectName))) {
                return true;
            }
            // Already gone. Not an error - a retried cascade reaches here - but
            // it is the same outcome for the caller as a refusal would be.
            log.info("Object '{}' was not present in bucket '{}'", objectName, bucketName);
            return false;
        } catch (Exception e) {
            log.error("Failed to delete object '{}' from bucket '{}'; it stays in storage "
                    + "and this line is the only record of it", objectName, bucketName, e);
            return false;
        }
    }

    // getPhotos() used to live here, behind GET /api/photos: it enumerated the
    // WHOLE bucket and returned every object's public URL to any authenticated
    // employee. While ID photos were stored, that was a one-call listing of
    // every scanned identity document in the company. Both it and its endpoint
    // are gone (TODO-14). Nothing needs to enumerate the bucket; the rows that
    // own an object already know its key.

    /**
     * A time-limited URL that can actually fetch a private object (TODO-46).
     *
     * <p>Objects are unreadable without a signature, so the stored URL does not
     * resolve for anyone. This signs a short-lived GET for it, and the signature
     * is what carries the authorisation - which means <b>the caller must have
     * already decided the requester is allowed to see it</b>. Every caller today
     * is behind {@code TaskAccessPolicy.requireCanAccessTask}; a new one without
     * an equivalent check would hand out access this method cannot withhold.
     *
     * <p>The window is deliberately short but not tiny. Long enough that a
     * driver can open a task, scroll its photos and come back without the images
     * dying mid-view; short enough that a URL copied out of a screenshot, a
     * proxy log or browser history is worthless by the time anyone tries it.
     * Both clients refetch the list whenever the screen opens - web's
     * {@code useTaskPhotos} sets no staleTime, mobile's CloudPhotoViewer holds
     * them in component state - so nothing needs to survive longer.
     *
     * <p>There is no signing key on disk. V4 signing goes through the IAM
     * {@code signBlob} API as the runtime service account, which is why that
     * account holds {@code roles/iam.serviceAccountTokenCreator} on ITSELF -
     * remove that binding and every photo link starts failing while uploads keep
     * working.
     *
     * @return a signed URL, or the input unchanged if signing fails - the caller
     *         gets a link that fails rather than an exception that blanks the
     *         whole gallery.
     */
    public String presignedUrl(String photoUrlOrName) {
        String objectName = extractObjectName(photoUrlOrName);
        try {
            BlobInfo blobInfo = BlobInfo.newBuilder(BlobId.of(bucketName, objectName)).build();
            return getStorage().signUrl(
                    blobInfo,
                    PRESIGNED_URL_TTL.toMinutes(),
                    TimeUnit.MINUTES,
                    Storage.SignUrlOption.withV4Signature()).toString();
        } catch (Exception e) {
            log.error("Failed to sign object '{}' in bucket '{}'; returning the unsigned URL, "
                    + "which will not resolve", objectName, bucketName, e);
            return photoUrlOrName;
        }
    }

    /** {@link #presignedUrl(String)} over a list, preserving order. */
    public List<String> presignedUrls(List<String> photoUrlsOrNames) {
        return photoUrlsOrNames.stream().map(this::presignedUrl).toList();
    }

    /**
     * Extracts the object name from a canonical URL, a gs:// URI, or returns the
     * input as-is when it is already a key.
     */
    private String extractObjectName(String input) {
        String httpsPrefix = PUBLIC_URL_BASE + bucketName + "/";
        if (input.startsWith(httpsPrefix)) {
            return input.substring(httpsPrefix.length());
        }
        String gsPrefix = "gs://" + bucketName + "/";
        if (input.startsWith(gsPrefix)) {
            return input.substring(gsPrefix.length());
        }
        return input;
    }
}
