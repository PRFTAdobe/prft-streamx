package com.prft.lumax.ai;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)  // ignores _rid, _self, _etag, _ts etc.
@Getter
@Setter
public class Product {

    private String id;
    private String productid;
    private String name;
    private String description;
    private String slug;

    @JsonProperty("ai_payload")
    private List<String> aiPayload;

    private List<View> views;

    @JsonIgnoreProperties(ignoreUnknown = true)
    @Getter
    @Setter
    public static class View {
        private String name;
        private String description;
        private String url;
        // getters + setters
    }

    // getters + setters
}