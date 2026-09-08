using IdsFintechPortal.Api.DTOs;

namespace IdsFintechPortal.Api.Repositories;

public interface IDeploymentResponsibilityRepository
{
    Task<IEnumerable<DeploymentResponsibilityResponse>>
        GetByDeploymentIdAsync(int deploymentId);

    Task<int> CreateAsync(
        CreateDeploymentResponsibilityRequest request);

    Task<bool> UpdateAsync(
        int id,
        CreateDeploymentResponsibilityRequest request);

    Task<bool> DeleteAsync(int id);
}