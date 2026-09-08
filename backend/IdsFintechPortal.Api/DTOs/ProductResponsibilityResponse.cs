namespace IdsFintechPortal.Api.DTOs;

public class ProductResponsibilityResponse
{
    public int Id { get; set; }

    public int ProductId { get; set; }

    public string ProductName { get; set; } = string.Empty;

    public int TeamMemberId { get; set; }

    public string TeamMemberName { get; set; } = string.Empty;

    public string Responsibility { get; set; } = string.Empty;

    public string? Description { get; set; }

    public DateTime CreatedAt { get; set; }
}