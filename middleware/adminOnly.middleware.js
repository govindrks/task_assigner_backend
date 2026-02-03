/* =====================================================
   Task field permission guard
   Admin → all
   Member → status + priority only
===================================================== */
export const allowTaskUpdate = (req, res, next) => {
  const ADMIN_FIELDS = [
    "title",
    "description",
    "assignedTo",
    "dueDate",
    "status",
    "priority",
  ];

  const MEMBER_FIELDS = ["status", "priority"];

  const isAdmin = req.isAdmin; // set by route if needed

  const allowed = isAdmin ? ADMIN_FIELDS : MEMBER_FIELDS;

  const updates = Object.keys(req.body);

  const valid = updates.every((field) => allowed.includes(field));

  if (!valid) {
    return res.status(403).json({
      message: "You are not allowed to update these fields",
    });
  }

  next();
};
