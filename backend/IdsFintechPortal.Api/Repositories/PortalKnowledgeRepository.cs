using Dapper;
using IdsFintechPortal.Api.Data;
using IdsFintechPortal.Api.Models;

namespace IdsFintechPortal.Api.Repositories;

public sealed class PortalKnowledgeRepository : IPortalKnowledgeRepository
{
    private readonly DbConnectionFactory _dbConnectionFactory;

    public PortalKnowledgeRepository(DbConnectionFactory dbConnectionFactory)
    {
        _dbConnectionFactory = dbConnectionFactory;
    }

    public async Task<PortalKnowledgeSnapshot> GetSnapshotAsync(
        CancellationToken cancellationToken = default)
    {
        const string sql = """
            SELECT Id, Name, Description, BusinessPurpose, LifecycleStatus,
                   CurrentVersion, SupportedMarkets
            FROM Products
            ORDER BY Name;

            SELECT Id, CompanyName, Country, Status
            FROM Clients
            ORDER BY CompanyName;

            SELECT d.Id, d.ClientId, c.CompanyName AS ClientName,
                   d.ProductId, p.Name AS ProductName, d.ProductVersion,
                   d.GoLiveDate, d.Status, d.SupportTier
            FROM Deployments d
            INNER JOIN Clients c ON c.Id = d.ClientId
            INNER JOIN Products p ON p.Id = d.ProductId
            ORDER BY d.Id;

            SELECT pt.ProductId, t.Name
            FROM ProductTechnologies pt
            INNER JOIN Technologies t ON t.Id = pt.TechnologyId
            ORDER BY pt.ProductId, t.Name;

            SELECT ProductId, Name
            FROM ProductModules
            ORDER BY ProductId, Name;

            SELECT dm.DeploymentId, pm.Name
            FROM DeploymentModules dm
            INNER JOIN ProductModules pm ON pm.Id = dm.ProductModuleId
            ORDER BY dm.DeploymentId, pm.Name;

            SELECT DeploymentId, Name, Type
            FROM Environments
            ORDER BY DeploymentId, Name;

            SELECT pr.ProductId, tm.FullName AS TeamMemberName,
                   tm.JobTitle, tm.Department, pr.Responsibility
            FROM ProductResponsibilities pr
            INNER JOIN TeamMembers tm ON tm.Id = pr.TeamMemberId
            ORDER BY pr.ProductId, tm.FullName;

            SELECT dr.DeploymentId, tm.FullName AS TeamMemberName,
                   tm.JobTitle, tm.Department, dr.Responsibility
            FROM DeploymentResponsibilities dr
            INNER JOIN TeamMembers tm ON tm.Id = dr.TeamMemberId
            ORDER BY dr.DeploymentId, tm.FullName;

            SELECT ProductId, Name, Description
            FROM Repositories
            ORDER BY ProductId, Name;

            SELECT ProductId, Name, DocumentType, Description
            FROM Documents
            ORDER BY ProductId, Name;
            """;

        using var connection = _dbConnectionFactory.CreateConnection();
        using var result = await connection.QueryMultipleAsync(
            new CommandDefinition(sql, cancellationToken: cancellationToken));

        return new PortalKnowledgeSnapshot
        {
            Products = (await result.ReadAsync<ProductKnowledge>()).AsList(),
            Clients = (await result.ReadAsync<ClientKnowledge>()).AsList(),
            Deployments = (await result.ReadAsync<DeploymentKnowledge>()).AsList(),
            Technologies = (await result.ReadAsync<ProductNamedKnowledge>()).AsList(),
            ProductModules = (await result.ReadAsync<ProductNamedKnowledge>()).AsList(),
            DeploymentModules = (await result.ReadAsync<DeploymentNamedKnowledge>()).AsList(),
            Environments = (await result.ReadAsync<DeploymentEnvironmentKnowledge>()).AsList(),
            ProductResponsibilities = (await result.ReadAsync<ProductResponsibilityKnowledge>()).AsList(),
            DeploymentResponsibilities = (await result.ReadAsync<DeploymentResponsibilityKnowledge>()).AsList(),
            Repositories = (await result.ReadAsync<ProductResourceKnowledge>()).AsList(),
            Documents = (await result.ReadAsync<ProductDocumentKnowledge>()).AsList()
        };
    }
}
