package org.prft.deliveryservice;

import org.apache.avro.specific.AvroGenerated;

@AvroGenerated
public class StringWrapper {

    private String value;

    public StringWrapper() {
        // needed for Avro serialization
    }

    public StringWrapper(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}