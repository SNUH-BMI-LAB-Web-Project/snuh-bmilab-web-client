export const getProfessorKey = (p: {
  name?: string;
  organization?: string;
  department?: string;
  position?: string;
}) => `${p.name}-${p.organization}-${p.department}-${p.position}`;
