import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({ name: "tEmployee" })
export class HREmployee {
  @PrimaryColumn({ name: "ID", type: "bigint" })
  id: string;

  @Column({ name: "Code", type: "nvarchar", length: 50 })
  code: string;

  @Column({ name: "EmailAdd", type: "nvarchar", length: 255, nullable: true })
  email: string;

  @Column({ name: "FirstName", type: "nvarchar", length: 255 })
  firstName: string;

  @Column({ name: "LastName", type: "nvarchar", length: 255, nullable: true })
  lastName: string;

  @Column({ name: "FullName", type: "nvarchar", length: 255 })
  fullName: string;
}

@Entity({ name: "tEmploymentRecord" })
export class HREmploymentRecord {
  @PrimaryColumn({ name: "ID_Employee", type: "bigint" })
  employeeId: string;

  @Column({ name: "Name_Company", type: "nvarchar", length: 255, nullable: true })
  company: string | null;

  @Column({ name: "Name_Department", type: "nvarchar", length: 255, nullable: true })
  department: string | null;

  @Column({ name: "Name_PositionLevel", type: "nvarchar", length: 255, nullable: true })
  position: string | null;
}

@Entity({ name: "tSysUser" })
export class HRUser {
  @Column({ name: "ID_Employee", type: "bigint" })
  employeeId: string;

  @PrimaryColumn({ name: "ID", type: "bigint" })
  hrdotnetId: string;

  @Column({ name: "Username", type: "nvarchar", length: 255 })
  username: string;
}
