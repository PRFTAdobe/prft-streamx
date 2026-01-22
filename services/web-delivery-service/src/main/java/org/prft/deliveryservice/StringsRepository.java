package org.prft.deliveryservice;

import jakarta.enterprise.context.ApplicationScoped;
import java.util.HashMap;
import java.util.Map;

@ApplicationScoped
public class StringsRepository {

    private final Map<String, String> strings = new HashMap<>();

    public boolean containsKey(String key) {
        return strings.containsKey(key);
    }

    public String get(String key) {
        return strings.get(key);
    }

    public void put(String key, String value) {
        strings.put(key, value);
    }

    public void remove(String key) {
        strings.remove(key);
    }

    public void clear() {
        strings.clear();
    }

}