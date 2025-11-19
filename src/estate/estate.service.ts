async createHome(dto: CreateHomeDto) {
  const tempPassword = "OC-"+Math.floor(10000 + Math.random() * 90000);
  const hashedPw = await bcrypt.hash(tempPassword, 10);

  // Save resident to Supabase users table
  const resident = await this.userRepository.save({
    email: dto.residentEmail,
    password: hashedPw,
    role: "resident",
    estate_id: dto.estateId,
    full_name: dto.residentName,
  });

  // Save home
  const home = await this.homeRepository.save({
    name: dto.name,
    unit: dto.unit,
    block: dto.block,
    estate_id: dto.estateId,
    resident_id: resident.id,
    description: dto.description,
    electricityMeter: dto.electricityMeter,
    waterMeter: dto.waterMeter,
    internetId: dto.internetId,
    gateCode: dto.gateCode,
  });

  return {
    message: "Home created and resident user stored successfully",
    resident: {
      email: dto.residentEmail,
      tempPassword,
    },
    home,
  };
}
