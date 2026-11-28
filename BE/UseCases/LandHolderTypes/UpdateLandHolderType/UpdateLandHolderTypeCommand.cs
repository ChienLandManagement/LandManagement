using LandManagement.Common.Interfaces;
using LandManagement.Entities;

namespace LandManagement.UseCases.LandHolderTypes.UpdateLandHolderType;

public record UpdateLandHolderTypeCommand(Guid Id, string Code, string Name, Guid? ParentId, int SortOrder, LandHolderKind Kind) : ICommand<LandHolderTypeItem>;
