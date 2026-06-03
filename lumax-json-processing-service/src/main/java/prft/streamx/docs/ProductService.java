package prft.streamx.docs;

import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;

import java.util.Map;

@RegisterRestClient(configKey="product-api")
public interface ProductService {

    @POST
    @Path("/index")
    Map<String, String> indexProduct(Product product);
}
