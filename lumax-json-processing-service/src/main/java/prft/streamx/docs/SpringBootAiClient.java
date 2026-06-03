package prft.streamx.docs;

import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;

@RegisterRestClient(configKey = "spring-boot-ai")
@Path("/api/products")
public interface SpringBootAiClient {

    @POST
    @Path("/index")
    @Consumes(MediaType.APPLICATION_JSON)
    void indexProduct(String productJson);

    @DELETE
    @Path("/index/{id}")
    void deleteProduct(@PathParam("id") String id);
}