resource "aws_key_pair" "hosty_key" {
  key_name   = "hosty-key"
  public_key = file("terra_ed25519.pub")
}

resource "aws_default_vpc" "default" {
  tags = {
    Name = "Default VPC"
  }
}

resource "aws_security_group" "hosty_security_group" {
  name   = "hosty-security-group"
  vpc_id = aws_default_vpc.default.id

  tags = {
    Name = "hosty-security-group"
  }

  # ==========================================
  # 🌟 THE KUBERNETES INTERNAL NETWORK FIX 🌟
  # Allows all UDP, TCP, and ICMP traffic between
  # the Master and Worker nodes for DNS/Flannel.
  # ==========================================
  ingress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1" # -1 means ALL protocols
    self        = true # Applies strictly to instances inside this Security Group
    description = "Allow ALL internal cluster traffic (UDP/TCP/ICMP)"
  }

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow SSH Access/Open"
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow HTTP Access/Open"
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow HTTPS Access/Open"
  }

  # ingress {
  #   from_port   = 6443
  #   to_port     = 6443
  #   protocol    = "tcp"
  #   cidr_blocks = ["0.0.0.0/0"]
  #   description = "Kubernetes API Server"

  # }

  ingress {
    from_port   = 5001
    to_port     = 5001
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Hosty Backend Port"
  }

  ingress {
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Hosty Frontend Port"
  }

  ingress {
    from_port   = 10250
    to_port     = 10250
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Kubelet API (for kubectl logs/exec)"

  }

  ingress {
    from_port   = 8090
    to_port     = 8090
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Jenkins Port"
  }

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "PostgreSQL Port"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow All Outbound Access/Open"
  }
}

resource "aws_instance" "hosty-ec2" {
  for_each = tomap({
    "1" = var.aws_instance_type,
    # "worker-1" = var.aws_instance_type,
    # "worker-2" = var.aws_instance_type,
  })

  depends_on      = [aws_key_pair.hosty_key, aws_security_group.hosty_security_group]
  key_name        = aws_key_pair.hosty_key.key_name
  security_groups = [aws_security_group.hosty_security_group.name]

  instance_type = each.value
  ami           = var.ec2_ami_id
  user_data     = file("docker_installation.sh")
  root_block_device {
    volume_size = var.ec2_storage_size
    volume_type = "gp3"
  }

  tags = {
    Name = "hosty-ec2-${each.key}"
  }
}




