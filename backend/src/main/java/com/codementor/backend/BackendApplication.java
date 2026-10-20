package com.codementor.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.File;
import java.nio.file.Files;
import java.util.List;

@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) {
		loadDotEnv();
		SpringApplication.run(BackendApplication.class, args);
	}

	/**
	 * Automatically reads .env from backend directory or project root if present
	 * and sets system properties for any variables not already defined in the OS environment.
	 */
	private static void loadDotEnv() {
		File[] candidates = new File[] {
			new File(".env"),
			new File("../.env")
		};
		for (File file : candidates) {
			if (file.exists() && file.isFile()) {
				try {
					List<String> lines = Files.readAllLines(file.toPath());
					for (String rawLine : lines) {
						String line = rawLine.trim();
						if (line.isEmpty() || line.startsWith("#")) continue;
						int eqIdx = line.indexOf('=');
						if (eqIdx > 0) {
							String key = line.substring(0, eqIdx).trim();
							String value = line.substring(eqIdx + 1).trim();
							if ((value.startsWith("\"") && value.endsWith("\"")) ||
								(value.startsWith("'") && value.endsWith("'"))) {
								value = value.substring(1, value.length() - 1);
							}
							if (System.getProperty(key) == null && System.getenv(key) == null) {
								System.setProperty(key, value);
							}
						}
					}
				} catch (Exception ignored) {
				}
			}
		}
	}

}
