package com.example.demo.config;

import org.springframework.boot.system.ApplicationHome;
import org.springframework.stereotype.Component;

import java.nio.file.Path;
import java.nio.file.Paths;

@Component
public class StoragePathResolver {

    public Path resolve(String configuredPath) {
        if (configuredPath == null || configuredPath.isBlank()) {
            throw new IllegalArgumentException("La ruta de almacenamiento no puede estar vacía");
        }

        Path path = Paths.get(configuredPath);
        for (Path part : path) {
            if ("..".equals(part.toString())) {
                throw new IllegalArgumentException("La ruta de almacenamiento no puede contener segmentos '..'");
            }
        }

        if (path.isAbsolute()) {
            return path.normalize();
        }

        Path backendRoot = getBackendRoot();
        return backendRoot.resolve(path).normalize();
    }

    private Path getBackendRoot() {
        Path current = new ApplicationHome(StoragePathResolver.class).getDir().toPath().normalize();

        Path parent = current.getParent();
        if (current.getFileName() != null && current.getFileName().toString().equals("classes") && parent != null) {
            if (parent.getFileName() != null && parent.getFileName().toString().equals("target") && parent.getParent() != null) {
                return parent.getParent().normalize();
            }

            Path grandparent = parent.getParent();
            if (grandparent != null
                    && "java".equals(parent.getFileName().toString())
                    && "classes".equals(grandparent.getFileName().toString())
                    && grandparent.getParent() != null) {
                return grandparent.getParent().normalize();
            }
        }

        while (current.getFileName() != null && current.getFileName().toString().equals("target")) {
            Path parentPath = current.getParent();
            if (parentPath == null) {
                break;
            }
            current = parentPath;
        }

        return current;
    }
}
