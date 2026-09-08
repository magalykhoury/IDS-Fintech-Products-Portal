namespace IdsFintechPortal.Api.Models;

public sealed class PortalKnowledgeSnapshot
{
    public IReadOnlyList<ProductKnowledge> Products { get; init; } = [];
    public IReadOnlyList<ClientKnowledge> Clients { get; init; } = [];
    public IReadOnlyList<DeploymentKnowledge> Deployments { get; init; } = [];
    public IReadOnlyList<ProductNamedKnowledge> Technologies { get; init; } = [];
    public IReadOnlyList<ProductNamedKnowledge> ProductModules { get; init; } = [];
    public IReadOnlyList<DeploymentNamedKnowledge> DeploymentModules { get; init; } = [];
    public IReadOnlyList<DeploymentEnvironmentKnowledge> Environments { get; init; } = [];
    public IReadOnlyList<ProductResponsibilityKnowledge> ProductResponsibilities { get; init; } = [];
    public IReadOnlyList<DeploymentResponsibilityKnowledge> DeploymentResponsibilities { get; init; } = [];
    public IReadOnlyList<ProductResourceKnowledge> Repositories { get; init; } = [];
    public IReadOnlyList<ProductDocumentKnowledge> Documents { get; init; } = [];
}

public sealed record ProductKnowledge(
    int Id,
    string Name,
    string? Description,
    string? BusinessPurpose,
    string LifecycleStatus,
    string? CurrentVersion,
    string? SupportedMarkets);

public sealed record ClientKnowledge(
    int Id,
    string CompanyName,
    string? Country,
    string Status);

public sealed record DeploymentKnowledge(
    int Id,
    int ClientId,
    string ClientName,
    int ProductId,
    string ProductName,
    string ProductVersion,
    DateTime? GoLiveDate,
    string Status,
    string? SupportTier);

public sealed record ProductNamedKnowledge(
    int ProductId,
    string Name);

public sealed record DeploymentNamedKnowledge(
    int DeploymentId,
    string Name);

public sealed record DeploymentEnvironmentKnowledge(
    int DeploymentId,
    string Name,
    string Type);

public sealed record ProductResponsibilityKnowledge(
    int ProductId,
    string TeamMemberName,
    string? JobTitle,
    string? Department,
    string Responsibility);

public sealed record DeploymentResponsibilityKnowledge(
    int DeploymentId,
    string TeamMemberName,
    string? JobTitle,
    string? Department,
    string Responsibility);

public sealed record ProductResourceKnowledge(
    int ProductId,
    string Name,
    string? Description);

public sealed record ProductDocumentKnowledge(
    int ProductId,
    string Name,
    string DocumentType,
    string? Description);
