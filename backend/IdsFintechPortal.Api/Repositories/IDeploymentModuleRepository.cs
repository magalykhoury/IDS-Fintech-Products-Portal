using IdsFintechPortal.Api.DTOs;

namespace IdsFintechPortal.Api.Repositories;

public interface IDeploymentModuleRepository
{
    Task<IEnumerable<DeploymentModuleResponse>> GetByDeploymentIdAsync(int deploymentId);

    Task<bool> AddAsync(int deploymentId, int productModuleId);

    Task<bool> RemoveAsync(int deploymentId, int productModuleId);
}
