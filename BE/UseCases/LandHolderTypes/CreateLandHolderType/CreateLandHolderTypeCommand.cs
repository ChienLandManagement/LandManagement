using LandManagement.Common.Interfaces;
using LandManagement.Entities;

namespace LandManagement.UseCases.LandHolderTypes.CreateLandHolderType;

public record CreateLandHolderTypeCommand(string Code, string Name, Guid? ParentId, LandHolderKind Kind) : ICommand<LandHolderTypeItem>;
