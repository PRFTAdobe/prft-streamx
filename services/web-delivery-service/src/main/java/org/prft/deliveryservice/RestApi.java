package org.prft.deliveryservice;

import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import org.jboss.resteasy.reactive.RestResponse;
import org.jboss.resteasy.reactive.RestResponse.ResponseBuilder;

@Path("/api")
public class RestApi {

    @Inject
    StringsRepository stringsRepository;

    @GET
    @Path("strings/{key}")
    public RestResponse<String> getStringByKey(@PathParam("key") String key) {
        if (stringsRepository.containsKey(key)) {
            return ResponseBuilder.ok(stringsRepository.get(key)).build();
        } else {
            return ResponseBuilder.<String>notFound().build();
        }
    }
}