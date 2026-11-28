using LandManagement.Common.Interfaces;

namespace LandManagement.UseCases.LandChanges.UpdateLandChange;

public record UpdateLandChangeCommand(Guid Id, DateOnly ChangeDate, Guid? FromLandTypeId, Guid? ToLandTypeId, decimal Area, Guid? HolderTypeId, string? Note)
    : ICommand<LandChangeItem>;
