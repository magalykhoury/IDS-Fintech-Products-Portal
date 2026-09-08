using IdsFintechPortal.Api.DTOs;

namespace IdsFintechPortal.Api.Repositories;

public interface IDeploymentRepository
{
    Task<IEnumerable<DeploymentResponse>> GetAllAsync();

    Task<DeploymentResponse?> GetByIdAsync(int id);

    Task<int> CreateAsync(CreateDeploymentRequest request);

    Task<bool> UpdateAsync(int id, UpdateDeploymentRequest request);

    Task<bool> DeleteAsync(int id);
}