package com.auth.email;

import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

@Service
@RequiredArgsConstructor
public class EmailTemplateService {

    // Properties to hold the templates
    private final Map<String, String> cachedSubjects = new HashMap<>();
    private final Map<String, String> cachedBodies = new HashMap<>();
    private boolean templatesLoaded = false;

    public void loadTemplates(String fileName) {

            if (!templatesLoaded) {
                Properties emailTemplates = new Properties();

                try {
                    Resource resource = new ClassPathResource(fileName);
                    emailTemplates.load(Files.newInputStream(resource.getFile().toPath()));

                    // Cache subjects and bodies
                    for (String key : emailTemplates.stringPropertyNames()) {
                        if (key.endsWith(".subject")) {
                            cachedSubjects.put(key.replace(".subject", ""), emailTemplates.getProperty(key));
                        } else if (key.endsWith(".body")) {
                            cachedBodies.put(key.replace(".body", ""), emailTemplates.getProperty(key));
                        }
                    }

                    templatesLoaded = true; // Mark templates as loaded

                } catch (IOException e) {
                    throw new RuntimeException("Failed to load email templates from " + fileName, e);
                }
            }
    }

    public String getSubject(String key) {
        loadTemplates("email-templates.properties"); // Call to load templates if not already loaded
        return cachedSubjects.getOrDefault(key, "No Subject"); // Use cached subjects
    }

    public String replacePlaceholders(String template, Map<String, String> placeholders) {
        for (Map.Entry<String, String> entry : placeholders.entrySet()) {
            template = template.replace("{" + entry.getKey() + "}", entry.getValue());
        }
        return template;
    }

    //    Modify your EmailTemplateService to replace placeholders dynamically.
    public String getFormattedBody(String key, Map<String, String> placeholders) {
        loadTemplates("email-templates.properties"); // Ensure templates are loaded
        String body = cachedBodies.getOrDefault(key, "No Content");

        // Replace placeholders dynamically
        for (Map.Entry<String, String> entry : placeholders.entrySet()) {
            body = body.replace("{" + entry.getKey() + "}", entry.getValue());
        }

        return body;
    }

}
