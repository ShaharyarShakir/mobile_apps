#!/bin/sh
set -e

echo "Waiting for Garage S3 daemon..."
until garage status >/dev/null 2>&1; do
  sleep 1
done

echo "Checking layout..."
NODE_ID=$(garage node id -q)
if [ -z "$NODE_ID" ]; then
  echo "Error: Could not retrieve Garage node ID"
  exit 1
fi

# Assign node layout if not set
if ! garage layout show | grep -q "dc1"; then
  echo "Assigning layout to zone dc1..."
  garage layout assign -z dc1 -c 1G "$NODE_ID"
  garage layout apply --version 1
fi

# Create bucket if not exists
if ! garage bucket list | grep -q "receipts"; then
  echo "Creating bucket 'receipts'..."
  garage bucket create receipts
fi

# Generate keys and write to shared env if not already done
if [ ! -f /shared/.env.garage ]; then
  echo "Generating new S3 credentials..."
  KEY_INFO=$(garage key create my-key)
  ACCESS_KEY=$(echo "$KEY_INFO" | grep "Access key ID:" | cut -d: -f2 | xargs)
  SECRET_KEY=$(echo "$KEY_INFO" | grep "Secret access key:" | cut -d: -f2 | xargs)
  
  if [ -z "$ACCESS_KEY" ] || [ -z "$SECRET_KEY" ]; then
    # Fallback to alternative grepping depending on Garage version
    ACCESS_KEY=$(echo "$KEY_INFO" | grep "Key ID" | cut -d: -f2 | xargs)
    SECRET_KEY=$(echo "$KEY_INFO" | grep "Secret Key" | cut -d: -f2 | xargs)
  fi

  if [ -z "$ACCESS_KEY" ]; then
    echo "Error parsing access keys from: $KEY_INFO"
    exit 1
  fi

  echo "GARAGE_ACCESS_KEY=$ACCESS_KEY" > /shared/.env.garage
  echo "GARAGE_SECRET_KEY=$SECRET_KEY" >> /shared/.env.garage
  echo "Credentials written successfully: $ACCESS_KEY"
  
  # Set permissions
  garage bucket allow receipts --read --write --key my-key
else
  echo "S3 credentials already exist."
fi

echo "Garage initialization complete!"
