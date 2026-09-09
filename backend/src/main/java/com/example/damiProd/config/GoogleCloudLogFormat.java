package com.example.damiProd.config;

import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.classic.spi.IThrowableProxy;
import ch.qos.logback.classic.spi.ThrowableProxyUtil;
import com.fasterxml.jackson.core.io.JsonStringEncoder;
import org.springframework.boot.logging.structured.StructuredLogFormatter;

import java.time.Instant;
import java.util.Map;

/**
 * One JSON object per line, in the shape Google Cloud Logging actually parses
 * (TODO-104).
 *
 * <p><b>Why not a built-in format.</b> Spring Boot ships ECS, Logstash and
 * GELF. Cloud Logging picks a log entry's severity out of a TOP-LEVEL
 * {@code severity} member and its text out of a top-level {@code message}; ECS
 * nests the level as {@code log.level}, and
 * {@code logging.structured.json.rename} renames a member in place rather than
 * hoisting it, so the closest ECS gets is {@code log.severity} - which Cloud
 * Logging ignores, filing every line as INFO. Error alerting built on severity
 * would then never fire, which is a failure that looks exactly like "nothing is
 * going wrong".
 *
 * <p><b>The stack trace goes inside {@code message}, on purpose.</b> Cloud
 * Logging treats one entry as one line, so a 40-frame trace written as raw
 * multi-line output becomes 40 entries, 39 of them at the wrong severity and
 * none of them attached to the error. Appending it to the message keeps the
 * whole trace in the entry it belongs to, and Error Reporting recognises a Java
 * trace in that field.
 *
 * <p>MDC entries are copied to the top level, which is what makes the
 * {@code requestId} from {@link RequestIdFilter} a field you can query on. They
 * are written FIRST so that a key collision cannot let user-influenced MDC
 * content overwrite {@code severity} or {@code message}.
 */
public class GoogleCloudLogFormat implements StructuredLogFormatter<ILoggingEvent> {

    private static final JsonStringEncoder ENCODER = JsonStringEncoder.getInstance();

    @Override
    public String format(ILoggingEvent event) {
        StringBuilder json = new StringBuilder(256).append('{');

        // Null-checked because the interface permits it and an NPE in here would
        // take out logging itself - the one subsystem that has no way to report
        // its own failure.
        Map<String, String> mdc = event.getMDCPropertyMap();
        if (mdc != null) {
            for (Map.Entry<String, String> entry : mdc.entrySet()) {
                if (entry.getKey() == null || entry.getValue() == null) continue;
                append(json, entry.getKey(), entry.getValue());
            }
        }

        append(json, "severity", severityOf(event));
        append(json, "time", Instant.ofEpochMilli(event.getTimeStamp()).toString());
        append(json, "logger", event.getLoggerName());
        append(json, "thread", event.getThreadName());
        append(json, "message", messageOf(event));

        json.setLength(json.length() - 1); // trailing comma

        // The newline is the formatter's job, not the appender's: Spring Boot
        // writes exactly what this returns, and without it every entry is
        // concatenated onto one enormous line that Cloud Logging reads as a
        // single unparseable message. The built-in formatters terminate their
        // output for the same reason.
        return json.append("}\n").toString();
    }

    /**
     * Logback's WARN/ERROR/INFO/DEBUG/TRACE are already Cloud Logging severity
     * names, with one exception: TRACE does not exist there and falls back to
     * DEBUG rather than being dropped.
     */
    private static String severityOf(ILoggingEvent event) {
        String level = event.getLevel().toString();
        return "TRACE".equals(level) ? "DEBUG" : level;
    }

    private static String messageOf(ILoggingEvent event) {
        String message = event.getFormattedMessage();
        IThrowableProxy thrown = event.getThrowableProxy();
        return thrown == null ? message : message + "\n" + ThrowableProxyUtil.asString(thrown);
    }

    private static void append(StringBuilder json, String key, String value) {
        json.append('"').append(ENCODER.quoteAsString(key)).append("\":\"")
                .append(ENCODER.quoteAsString(value)).append("\",");
    }
}
