export enum RepairStatus {
  PENDING = "pending",
  IN_REPAIR = "in_repair", 
  WAITING_FOR_PARTS = "waiting_for_parts",
  READY_FOR_PICKUP = "ready_for_pickup",
  COMPLETED = "completed",
  CANCELLED = "cancelled"
}

export enum UserRole {
  OWNER = "owner"
}