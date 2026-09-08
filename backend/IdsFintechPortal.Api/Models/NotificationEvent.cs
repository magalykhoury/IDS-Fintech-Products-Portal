namespace IdsFintechPortal.Api.Models;

public sealed record NotificationEvent(
    string Type,
    string Category,
    string Title,
    string Message,
    string? RelatedEntityType,
    int? RelatedEntityId,
    string? Link);
