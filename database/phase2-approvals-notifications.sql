-- IDS Fintech Products Portal - Phase 2 additive schema
-- Run against IdsFintechPortal after the existing application schema.

SET ANSI_NULLS ON;
SET ANSI_PADDING ON;
SET ANSI_WARNINGS ON;
SET ARITHABORT ON;
SET CONCAT_NULL_YIELDS_NULL ON;
SET QUOTED_IDENTIFIER ON;
SET NUMERIC_ROUNDABORT OFF;
GO

IF OBJECT_ID(N'dbo.ApprovalRequests', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.ApprovalRequests
    (
        Id int IDENTITY(1,1) NOT NULL CONSTRAINT PK_ApprovalRequests PRIMARY KEY,
        EntityType nvarchar(50) NOT NULL,
        EntityId int NOT NULL,
        Title nvarchar(200) NOT NULL,
        Description nvarchar(1000) NULL,
        RequestedByUserId int NOT NULL,
        Status nvarchar(20) NOT NULL CONSTRAINT DF_ApprovalRequests_Status DEFAULT N'Pending',
        ReviewedByUserId int NULL,
        ReviewComment nvarchar(1000) NULL,
        CreatedAt datetime2(7) NOT NULL CONSTRAINT DF_ApprovalRequests_CreatedAt DEFAULT SYSUTCDATETIME(),
        ReviewedAt datetime2(7) NULL,
        CONSTRAINT CK_ApprovalRequests_EntityType CHECK (EntityType IN (N'Deployment')),
        CONSTRAINT CK_ApprovalRequests_Status CHECK (Status IN (N'Pending', N'Approved', N'Rejected')),
        CONSTRAINT FK_ApprovalRequests_RequestedBy FOREIGN KEY (RequestedByUserId) REFERENCES dbo.Users(Id),
        CONSTRAINT FK_ApprovalRequests_ReviewedBy FOREIGN KEY (ReviewedByUserId) REFERENCES dbo.Users(Id)
    );
END;
GO

IF NOT EXISTS
(
    SELECT 1
    FROM sys.indexes
    WHERE name = N'UX_ApprovalRequests_PendingDeployment'
      AND object_id = OBJECT_ID(N'dbo.ApprovalRequests')
)
BEGIN
    CREATE UNIQUE INDEX UX_ApprovalRequests_PendingDeployment
        ON dbo.ApprovalRequests(EntityType, EntityId)
        WHERE Status = N'Pending';
END;
GO

IF OBJECT_ID(N'dbo.Notifications', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Notifications
    (
        Id int IDENTITY(1,1) NOT NULL CONSTRAINT PK_Notifications PRIMARY KEY,
        UserId int NOT NULL,
        Type nvarchar(50) NOT NULL,
        Category nvarchar(50) NOT NULL CONSTRAINT DF_Notifications_Category DEFAULT N'General',
        Title nvarchar(200) NOT NULL,
        Message nvarchar(1000) NOT NULL,
        RelatedEntityType nvarchar(50) NULL,
        RelatedEntityId int NULL,
        Link nvarchar(500) NULL,
        IsRead bit NOT NULL CONSTRAINT DF_Notifications_IsRead DEFAULT 0,
        CreatedAt datetime2(7) NOT NULL CONSTRAINT DF_Notifications_CreatedAt DEFAULT SYSUTCDATETIME(),
        ReadAt datetime2(7) NULL,
        CONSTRAINT CK_Notifications_RelatedEntityPair CHECK
            ((RelatedEntityType IS NULL AND RelatedEntityId IS NULL)
             OR (RelatedEntityType IS NOT NULL AND RelatedEntityId IS NOT NULL)),
        CONSTRAINT FK_Notifications_User FOREIGN KEY (UserId) REFERENCES dbo.Users(Id)
    );
END;
GO

IF NOT EXISTS
(
    SELECT 1
    FROM sys.indexes
    WHERE name = N'IX_Notifications_UserUnread'
      AND object_id = OBJECT_ID(N'dbo.Notifications')
)
BEGIN
    CREATE INDEX IX_Notifications_UserUnread
        ON dbo.Notifications(UserId, IsRead, CreatedAt DESC);
END;
GO
