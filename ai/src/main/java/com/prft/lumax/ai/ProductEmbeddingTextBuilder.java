package com.prft.lumax.ai;

import org.springframework.stereotype.Component;

@Component
public class ProductEmbeddingTextBuilder {

    public String build(Product product) {
        StringBuilder sb = new StringBuilder();

        if (hasValue(product.getName()))
            sb.append("Product: ").append(product.getName()).append("\n");

        if (hasValue(product.getSlug()))
            sb.append("Slug: ").append(product.getSlug()).append("\n");

        if (hasValue(product.getDescription())) {
            String plain = product.getDescription()
                    .replaceAll("<[^>]*>", "")       // strip HTML tags
                    .replaceAll("&[^;]+;", " ")       // strip HTML entities
                    .replaceAll("\\s+", " ")           // collapse whitespace
                    .trim();
            if (!plain.isBlank())
                sb.append("Description: ").append(plain).append("\n");
        }

        if (product.getAiPayload() != null && !product.getAiPayload().isEmpty())
            sb.append("Tags: ")
                    .append(String.join(", ", product.getAiPayload()))
                    .append("\n");

        return sb.toString().trim();
    }

    private boolean hasValue(String s) {
        return s != null && !s.isBlank();
    }
}