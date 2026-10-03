const fs = require('fs');
let code = fs.readFileSync('prisma/schema.prisma', 'utf8');
code += `
model Homework {
  id          String   @id @default(uuid())
  date        DateTime
  content     String
  image_url   String?
  group_name  String
  created_by  String
  status      String   @default("ACTIVE")
  created_at  DateTime @default(now())
}
`;
fs.writeFileSync('prisma/schema.prisma', code);
