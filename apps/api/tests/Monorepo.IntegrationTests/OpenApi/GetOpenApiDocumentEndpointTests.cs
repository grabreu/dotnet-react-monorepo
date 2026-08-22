using Monorepo.IntegrationTests.Common;

namespace Monorepo.IntegrationTests.OpenApi;

[Collection(IntegrationTestCollection.Name)]
public sealed class GetOpenApiDocumentEndpointTests(ApiFactory factory)
{
    [Fact]
    public async Task GetOpenApiDocument_ReturnsOk()
    {
        // Arrange
        var client = factory.CreateClient();

        // Act
        var response = await client.GetAsync("/openapi/v1.json", TestContext.Current.CancellationToken);

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
}
