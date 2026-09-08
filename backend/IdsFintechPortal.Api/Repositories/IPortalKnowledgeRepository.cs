using IdsFintechPortal.Api.Models;

namespace IdsFintechPortal.Api.Repositories;

public interface IPortalKnowledgeRepository
{
    Task<PortalKnowledgeSnapshot> GetSnapshotAsync(
        CancellationToken cancellationToken = default);
}
