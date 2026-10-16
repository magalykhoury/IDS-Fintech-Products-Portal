using System.Text.Json;
using System.Text.RegularExpressions;
using IdsFintechPortal.Api.DTOs;
using IdsFintechPortal.Api.Models;
using IdsFintechPortal.Api.Repositories;

namespace IdsFintechPortal.Api.Services;

public sealed partial class PortalIntelligenceService
{
    private const string UnavailableAnswer =
        "The requested information is unavailable in the portal.";

    private static readonly HashSet<string> StopWords = new(
        [
            "a", "about", "an", "and", "are", "for", "from", "has", "have",
            "how", "in", "is", "it", "of", "on", "or", "our", "show", "summarize",
            "the", "their", "to", "use", "uses", "using", "what", "where", "which",
            "who", "with", "client", "clients", "deployment", "deployments", "document",
            "documentation", "environment", "environments", "product", "products",
            "repository", "repositories", "responsible", "running", "team", "version"
        ],
        StringComparer.OrdinalIgnoreCase);

    private readonly IPortalKnowledgeRepository _knowledgeRepository;
    private readonly IAiAnswerProvider _answerProvider;
    private readonly ILogger<PortalIntelligenceService> _logger;

    public PortalIntelligenceService(
        IPortalKnowledgeRepository knowledgeRepository,
        IAiAnswerProvider answerProvider,
        ILogger<PortalIntelligenceService> logger)
    {
        _knowledgeRepository = knowledgeRepository;
        _answerProvider = answerProvider;
        _logger = logger;
    }

    public async Task<IntelligenceQueryResponse> QueryAsync(
        string question,
        CancellationToken cancellationToken = default)
    {
        question = question.Trim();

        if (RestrictedInput().IsMatch(question))
        {
            return new IntelligenceQueryResponse
            {
                Answer = "This assistant does not process infrastructure, access, contact, credential, URL, note, or other restricted information.",
                ProviderStatus = "Restricted"
            };
        }

        var snapshot = await _knowledgeRepository.GetSnapshotAsync(cancellationToken);
        var context = SelectRelevant(snapshot, question);
        var sources = BuildSources(context);

        if (sources.Count == 0)
        {
            return new IntelligenceQueryResponse
            {
                Answer = UnavailableAnswer,
                ProviderStatus = "NoRelevantData"
            };
        }

        if (!_answerProvider.IsConfigured)
        {
            return new IntelligenceQueryResponse
            {
                Answer = "API Key not available at this moment.",
                ProviderStatus = "NotConfigured",
                Sources = sources
            };
        }

        try
        {
            var groundedContext = BuildGroundedContext(context);
            var answer = await _answerProvider.GenerateAsync(
                question,
                groundedContext,
                cancellationToken);

            return new IntelligenceQueryResponse
            {
                Answer = answer,
                ProviderStatus = "Generated",
                Model = _answerProvider.Model,
                Sources = sources
            };
        }
        catch (Exception exception) when (
            exception is HttpRequestException or JsonException or InvalidOperationException or TaskCanceledException)
        {
            _logger.LogWarning(
                "Portal intelligence provider failed with {ExceptionType}.",
                exception.GetType().Name);

            return new IntelligenceQueryResponse
            {
                Answer = "AI-assisted portal search is temporarily unavailable. Please try again later.",
                ProviderStatus = "ProviderUnavailable",
                Model = _answerProvider.Model,
                Sources = sources
            };
        }
    }

    private static RelevantKnowledge SelectRelevant(
        PortalKnowledgeSnapshot snapshot,
        string question)
    {
        var tokens = TokenPattern().Matches(question.ToLowerInvariant())
            .Select(match => match.Value)
            .Where(token => !StopWords.Contains(token))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();

        var productIds = snapshot.Products
            .Where(product => Matches(ProductText(snapshot, product), tokens))
            .Select(product => product.Id)
            .ToHashSet();
        var clientIds = snapshot.Clients
            .Where(client => Matches(
                $"{client.CompanyName} {client.Country} {client.Status}", tokens))
            .Select(client => client.Id)
            .ToHashSet();
        var deploymentIds = snapshot.Deployments
            .Where(deployment => Matches(DeploymentText(snapshot, deployment), tokens))
            .Select(deployment => deployment.Id)
            .ToHashSet();

        if (tokens.Length == 0)
        {
            if (ContainsAny(question, "repository", "repositories"))
            {
                productIds.UnionWith(snapshot.Repositories.Select(item => item.ProductId));
            }
            else if (ContainsAny(question, "document", "documentation"))
            {
                productIds.UnionWith(snapshot.Documents.Select(item => item.ProductId));
            }
            else if (ContainsAny(question, "deployment", "deployments", "environment", "environments"))
            {
                deploymentIds.UnionWith(snapshot.Deployments.Select(item => item.Id));
            }
            else if (ContainsAny(question, "client", "clients"))
            {
                clientIds.UnionWith(snapshot.Clients.Select(item => item.Id));
            }
            else if (ContainsAny(question, "product", "products"))
            {
                productIds.UnionWith(snapshot.Products.Select(item => item.Id));
            }
        }

        var relatedDeployments = snapshot.Deployments.Where(deployment =>
            deploymentIds.Contains(deployment.Id)
            || productIds.Contains(deployment.ProductId)
            || clientIds.Contains(deployment.ClientId));
        deploymentIds.UnionWith(relatedDeployments.Select(item => item.Id));

        productIds.UnionWith(snapshot.Deployments
            .Where(item => deploymentIds.Contains(item.Id))
            .Select(item => item.ProductId));
        clientIds.UnionWith(snapshot.Deployments
            .Where(item => deploymentIds.Contains(item.Id))
            .Select(item => item.ClientId));

        return new RelevantKnowledge(
            snapshot.Products.Where(item => productIds.Contains(item.Id)).ToArray(),
            snapshot.Clients.Where(item => clientIds.Contains(item.Id)).ToArray(),
            snapshot.Deployments.Where(item => deploymentIds.Contains(item.Id)).ToArray(),
            snapshot.Technologies.Where(item => productIds.Contains(item.ProductId)).ToArray(),
            snapshot.ProductModules.Where(item => productIds.Contains(item.ProductId)).ToArray(),
            snapshot.DeploymentModules.Where(item => deploymentIds.Contains(item.DeploymentId)).ToArray(),
            snapshot.Environments.Where(item => deploymentIds.Contains(item.DeploymentId)).ToArray(),
            snapshot.ProductResponsibilities.Where(item => productIds.Contains(item.ProductId)).ToArray(),
            snapshot.DeploymentResponsibilities.Where(item => deploymentIds.Contains(item.DeploymentId)).ToArray(),
            snapshot.Repositories.Where(item => productIds.Contains(item.ProductId)).ToArray(),
            snapshot.Documents.Where(item => productIds.Contains(item.ProductId)).ToArray());
    }

    private static string ProductText(PortalKnowledgeSnapshot snapshot, ProductKnowledge product) =>
        string.Join(' ',
            product.Name,
            product.Description,
            product.BusinessPurpose,
            product.LifecycleStatus,
            product.CurrentVersion,
            product.SupportedMarkets,
            string.Join(' ', snapshot.Technologies.Where(item => item.ProductId == product.Id).Select(item => item.Name)),
            string.Join(' ', snapshot.ProductModules.Where(item => item.ProductId == product.Id).Select(item => item.Name)),
            string.Join(' ', snapshot.Repositories.Where(item => item.ProductId == product.Id).Select(item => $"{item.Name} {item.Description}")),
            string.Join(' ', snapshot.Documents.Where(item => item.ProductId == product.Id).Select(item => $"{item.Name} {item.DocumentType} {item.Description}")),
            string.Join(' ', snapshot.ProductResponsibilities.Where(item => item.ProductId == product.Id).Select(item => $"{item.TeamMemberName} {item.JobTitle} {item.Department} {item.Responsibility}")));

    private static string DeploymentText(
        PortalKnowledgeSnapshot snapshot,
        DeploymentKnowledge deployment) =>
        string.Join(' ',
            deployment.ClientName,
            deployment.ProductName,
            deployment.ProductVersion,
            deployment.Status,
            deployment.SupportTier,
            deployment.GoLiveDate?.ToString("yyyy-MM-dd"),
            string.Join(' ', snapshot.DeploymentModules.Where(item => item.DeploymentId == deployment.Id).Select(item => item.Name)),
            string.Join(' ', snapshot.Environments.Where(item => item.DeploymentId == deployment.Id).Select(item => $"{item.Name} {item.Type}")),
            string.Join(' ', snapshot.DeploymentResponsibilities.Where(item => item.DeploymentId == deployment.Id).Select(item => $"{item.TeamMemberName} {item.JobTitle} {item.Department} {item.Responsibility}")));

    private static bool Matches(string text, IReadOnlyList<string> tokens) =>
        tokens.Count > 0 && tokens.Any(token =>
            token.Length == 1
                ? Regex.IsMatch(text, $@"(?:^|\W){Regex.Escape(token)}(?:$|\W)", RegexOptions.IgnoreCase)
                : text.Contains(token, StringComparison.OrdinalIgnoreCase));

    private static bool ContainsAny(string text, params string[] values) =>
        values.Any(value => text.Contains(value, StringComparison.OrdinalIgnoreCase));

    private static string BuildGroundedContext(RelevantKnowledge context)
    {
        var json = JsonSerializer.Serialize(
            context,
            new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });

        return OutboundSensitiveData().Replace(json, "[redacted]");
    }

    private static IReadOnlyList<IntelligenceSourceResponse> BuildSources(
        RelevantKnowledge context)
    {
        var sources = context.Products.Select(product => new IntelligenceSourceResponse
        {
            EntityType = "Product",
            EntityId = product.Id,
            Label = product.Name,
            Path = $"/products/{product.Id}"
        }).Concat(context.Clients.Select(client => new IntelligenceSourceResponse
        {
            EntityType = "Client",
            EntityId = client.Id,
            Label = client.CompanyName,
            Path = $"/clients/{client.Id}"
        })).Concat(context.Deployments.Select(deployment => new IntelligenceSourceResponse
        {
            EntityType = "Deployment",
            EntityId = deployment.Id,
            Label = $"{deployment.ClientName} · {deployment.ProductName}",
            Path = $"/deployments/{deployment.Id}"
        }));

        return sources
            .GroupBy(source => (source.EntityType, source.EntityId))
            .Select(group => group.First())
            .Take(30)
            .ToArray();
    }

    [GeneratedRegex(@"https?://|www\.|[\w.%+-]+@[\w.-]+\.[A-Za-z]{2,}|(?:\+\d{1,3}[\s.-]?)?(?:\(\d{2,4}\)|\d{2,4})[\s.-]\d{3,4}[\s.-]\d{3,4}|\b(password|credential|secret|api[\s_-]*key|private[\s_-]*key|access[\s_-]*token|connection[\s_-]*string|server|database|contact|email|phone|application[\s_-]*url|monitoring[\s_-]*url|access[\s_-]*(instruction|reference)|notes?)\b", RegexOptions.IgnoreCase)]
    private static partial Regex RestrictedInput();

    [GeneratedRegex(@"-----BEGIN [^-]+ PRIVATE KEY-----[\s\S]*?-----END [^-]+ PRIVATE KEY-----|https?://[^\s\""<>]+|www\.[^\s\""<>]+|[\w.%+-]+@[\w.-]+\.[A-Za-z]{2,}|(?:\+\d{1,3}[\s.-]?)?(?:\(\d{2,4}\)|\d{2,4})[\s.-]\d{3,4}[\s.-]\d{3,4}|\b(?:password|credential|secret|api[\s_-]*key|private[\s_-]*key|access[\s_-]*token|connection[\s_-]*string)\b\s*[:=]\s*[^\s\"",;}]+", RegexOptions.IgnoreCase)]
    private static partial Regex OutboundSensitiveData();

    [GeneratedRegex(@"[\p{L}\p{N}][\p{L}\p{N}._-]*")]
    private static partial Regex TokenPattern();

    private sealed record RelevantKnowledge(
        IReadOnlyList<ProductKnowledge> Products,
        IReadOnlyList<ClientKnowledge> Clients,
        IReadOnlyList<DeploymentKnowledge> Deployments,
        IReadOnlyList<ProductNamedKnowledge> Technologies,
        IReadOnlyList<ProductNamedKnowledge> ProductModules,
        IReadOnlyList<DeploymentNamedKnowledge> DeploymentModules,
        IReadOnlyList<DeploymentEnvironmentKnowledge> Environments,
        IReadOnlyList<ProductResponsibilityKnowledge> ProductResponsibilities,
        IReadOnlyList<DeploymentResponsibilityKnowledge> DeploymentResponsibilities,
        IReadOnlyList<ProductResourceKnowledge> Repositories,
        IReadOnlyList<ProductDocumentKnowledge> Documents);
}
