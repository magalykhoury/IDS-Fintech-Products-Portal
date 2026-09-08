namespace IdsFintechPortal.Api.Services;

public interface IAiAnswerProvider
{
    bool IsConfigured { get; }

    string Model { get; }

    Task<string> GenerateAsync(
        string question,
        string groundedContext,
        CancellationToken cancellationToken = default);
}
