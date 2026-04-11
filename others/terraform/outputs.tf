output "ec2_public_ip" {

  value = [
    for instance in aws_instance.hosty-ec2 : {

      name       = instance.tags.Name
      public_ip  = instance.public_ip
      public_dns = instance.public_dns
      private_ip = instance.private_ip
    }
  ]

}
