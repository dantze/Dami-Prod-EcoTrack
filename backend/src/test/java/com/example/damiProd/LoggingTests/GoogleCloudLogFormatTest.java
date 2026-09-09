package com.example.damiProd.LoggingTests;

import ch.qos.logback.classic.Level;
import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.LoggerContext;
import ch.qos.logback.classic.spi.LoggingEvent;
import ch.qos.logback.classic.spi.ThrowableProxy;
import com.example.damiProd.config.GoogleCloudLogFormat;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * The log line Cloud Logging actually has to parse (TODO-104).
 *
 * Every assertion here corresponds to a way this was observed to break while it
 * was being written, each of which produced valid-looking JSON that Cloud
 * Logging would have mis-filed:
 *   - severity nested under `log` (what ECS + `rename` produced) => everything
 *     files as INFO and severity-based alerting never fires;
 *   - no trailing newline => all 40 startup entries concatenate into one line;
 *   - a stack trace left as raw multi-line output => one exception becomes N
 *     entries, N-1 of them at the wrong severity.
 */
class GoogleCloudLogFormatTest {

    private final GoogleCloudLogFormat format = new GoogleCloudLogFormat();
    private final LoggerContext context = new LoggerContext();
    private final Logger logger = context.getLogger("com.example.damiProd.Demo");

    private LoggingEvent event(Level level, String message) {
        return event(level, message, Map.of());
    }

    private LoggingEvent event(Level level, String message, Map<String, String> mdc) {
        LoggingEvent event = new LoggingEvent();
        event.setLoggerName(logger.getName());
        event.setLevel(level);
        event.setMessage(message);
        event.setThreadName("http-nio-8080-exec-1");
        event.setTimeStamp(1_757_000_000_000L);
        // Set explicitly: a LoggingEvent built by hand has no LoggerContext, and
        // logback's getMDCPropertyMap() would then NPE trying to reach the MDC
        // adapter through it. Real events always carry one.
        // logback refuses a second setMDCPropertyMap call, so it is set once here.
        event.setMDCPropertyMap(mdc);
        return event;
    }

    @Test
    @DisplayName("severity is TOP-LEVEL, which is the only place Cloud Logging reads it")
    void severityIsTopLevel() {
        String line = format.format(event(Level.ERROR, "boom"));

        assertThat(line).startsWith("{\"severity\":\"ERROR\"");
        assertThat(line).doesNotContain("\"log\":{");
    }

    @Test
    @DisplayName("each entry ends with a newline, so entries do not concatenate")
    void oneObjectPerLine() {
        String line = format.format(event(Level.INFO, "hello"));

        assertThat(line).endsWith("}\n");
        assertThat(line.chars().filter(c -> c == '\n').count())
                .as("exactly one terminator, and none in the middle")
                .isEqualTo(1);
    }

    @Test
    @DisplayName("MDC entries become queryable top-level fields, and cannot overwrite severity")
    void mdcIsPromotedButCannotShadowSeverity() {
        LoggingEvent event = event(Level.WARN, "token rejected", Map.of("requestId", "abc-123"));

        assertThat(format.format(event)).contains("\"requestId\":\"abc-123\"");

        // MDC is written first, so a key collision leaves the real severity as
        // the LAST value for that name - the one a JSON parser keeps.
        LoggingEvent spoofed = event(Level.ERROR, "x", Map.of("severity", "DEBUG"));
        String line = format.format(spoofed);
        assertThat(line.lastIndexOf("\"severity\":\"ERROR\""))
                .isGreaterThan(line.indexOf("\"severity\":\"DEBUG\""));
    }

    @Test
    @DisplayName("a stack trace rides inside message, so one exception stays one entry")
    void stackTraceIsFoldedIntoTheMessage() {
        LoggingEvent event = event(Level.ERROR, "upload failed");
        event.setThrowableProxy(new ThrowableProxy(new IllegalStateException("no bucket")));

        String line = format.format(event);

        assertThat(line).contains("upload failed");
        assertThat(line).contains("java.lang.IllegalStateException: no bucket");
        // Newlines inside the trace must be ESCAPED, not real, or the entry splits.
        assertThat(line.chars().filter(c -> c == '\n').count()).isEqualTo(1);
        assertThat(line).contains("\\n");
    }

    @Test
    @DisplayName("quotes and backslashes in a message cannot break the JSON")
    void messageIsEscaped() {
        String line = format.format(event(Level.INFO, "client said \"hi\" \\ bye"));

        assertThat(line).contains("\\\"hi\\\"");
        assertThat(line).endsWith("}\n");
    }

    @Test
    @DisplayName("TRACE maps to DEBUG, which Cloud Logging understands")
    void traceMapsToDebug() {
        assertThat(format.format(event(Level.TRACE, "x"))).contains("\"severity\":\"DEBUG\"");
    }
}
