namespace IdsFintechPortal.Api.DTOs;

public class DeploymentModuleResponse
{
    public int DeploymentId { get; set; }

    public int ProductModuleId { get; set; }

    public string ModuleName { get; set; } = string.Empty;

    public string? ModuleDescription { get; set; }

    public string ModuleStatus { get; set; } = string.Empty;
}