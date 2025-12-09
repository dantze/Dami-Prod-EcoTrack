package com.example.damiProd.service;

import com.google.cloud.storage.Blob;
import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class PhotoService {

    @Value("${gcp.project-id}")
    private String projectId;

    @Value("${gcp.bucket-name}")
    private String bucketName;

    private Storage storage;

    // Initialize Storage lazily or in a method to ensure properties are injected
    private Storage getStorage() {
        if (storage == null) {
            storage = StorageOptions.newBuilder().setProjectId(projectId).build().getService();
        }
        return storage;
    }

    /**
     * Uploads a file to Google Cloud Storage.
     *
     * @param file The MultipartFile to upload.
     * @return The public URL of the uploaded file.
     * @throws IOException If an I/O error occurs.
     */
    /**
     * Uploads a file to the root of the bucket.
     */
    /**
     * Uploads a file to the root of the bucket.
     */
    public String uploadPhoto(MultipartFile file) throws IOException {
        return uploadPhoto(file, null, null);
    }

    /**
     * Uploads a file to a specific folder in Google Cloud Storage.
     *
     * @param file   The MultipartFile to upload.
     * @param folder The folder path (e.g. "Individual Client Ids/"). Can be null.
     * @return The public URL of the uploaded file.
     * @throws IOException If an I/O error occurs.
     */
    public String uploadPhoto(MultipartFile file, String folder) throws IOException {
        return uploadPhoto(file, folder, null);
    }

    /**
     * Uploads a file to a specific folder with a custom filename.
     *
     * @param file           The MultipartFile to upload.
     * @param folder         The folder path.
     * @param customFileName The desired filename (without extension). Can be null.
     * @return The public URL of the uploaded file.
     * @throws IOException If an I/O error occurs.
     */
    public String uploadPhoto(MultipartFile file, String folder, String customFileName) throws IOException {
        String originalFileName = file.getOriginalFilename();
        if (originalFileName == null) {
            originalFileName = "unknown.jpg";
        }

        String extension = "";
        int i = originalFileName.lastIndexOf('.');
        if (i > 0) {
            extension = originalFileName.substring(i);
        }

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
            // Ensure folder ends with /
            if (!folder.endsWith("/")) {
                folder += "/";
            }
            objectName = folder + fileName;
        }

        BlobId blobId = BlobId.of(bucketName, objectName);
        BlobInfo blobInfo = BlobInfo.newBuilder(blobId)
                .setContentType(file.getContentType())
                .build();

        getStorage().createFrom(blobInfo, file.getInputStream());

        // Assuming the bucket is public or we want the public link style
        return String.format("https://storage.googleapis.com/%s/%s", bucketName, objectName);
    }

    /**
     * Deletes a photo from Google Cloud Storage given its full URL or filename.
     *
     * @param photoUrlOrName The full URL
     *                       (https://storage.googleapis.com/bucket/name) or just
     *                       the object name.
     * @return true if deleted, false if not found.
     */
    public boolean deletePhoto(String photoUrlOrName) {
        String objectName = extractObjectName(photoUrlOrName);
        BlobId blobId = BlobId.of(bucketName, objectName);
        return getStorage().delete(blobId);
    }

    /**
     * Lists all photo URLs in the configured bucket.
     *
     * @return A list of public URLs for all objects in the bucket.
     */
    public List<String> getPhotos() {
        List<String> photoUrls = new ArrayList<>();

        // Iterate over all blobs in the bucket
        for (Blob blob : getStorage().list(bucketName).iterateAll()) {
            photoUrls.add(String.format("https://storage.googleapis.com/%s/%s", bucketName, blob.getName()));
        }

        return photoUrls;
    }

    private String extractObjectName(String input) {
        // If input is a URL, extract the last part
        String prefix = String.format("https://storage.googleapis.com/%s/", bucketName);
        if (input.startsWith(prefix)) {
            return input.substring(prefix.length());
        }
        return input;
    }
}