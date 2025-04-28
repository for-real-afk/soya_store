#!/usr/bin/env python

"""
Script to make migrations and migrate the database.
Use this script to initialize or update the database schema.
"""

import os
import sys
import subprocess

def run_command(command):
    """Run a command and print output."""
    print(f"Running: {' '.join(command)}")
    try:
        result = subprocess.run(command, check=True, capture_output=True, text=True)
        print(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error: {e}")
        print(e.stdout)
        print(e.stderr)
        return False

def make_migrations():
    """Make migrations for all apps."""
    return run_command(['python', 'manage.py', 'makemigrations'])

def migrate():
    """Apply migrations."""
    return run_command(['python', 'manage.py', 'migrate'])

def create_superuser():
    """Create a superuser if one doesn't exist."""
    # Check if DJANGO_SUPERUSER_USERNAME is set
    if not os.environ.get('DJANGO_SUPERUSER_USERNAME'):
        print("Setting default superuser credentials...")
        os.environ['DJANGO_SUPERUSER_USERNAME'] = 'admin'
        os.environ['DJANGO_SUPERUSER_PASSWORD'] = 'admin123'
        os.environ['DJANGO_SUPERUSER_EMAIL'] = 'admin@organicbeans.com'
    
    return run_command([
        'python', 'manage.py', 'createsuperuser', 
        '--noinput',
    ])

def seed_data():
    """Seed initial data."""
    return run_command(['python', 'manage.py', 'loaddata', 'initial_data.json'])

def main():
    """Main function to run migrations."""
    # Ensure we're in the right directory
    if not os.path.exists('manage.py'):
        os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    # Run migrations
    print("=== Creating and applying migrations ===")
    if make_migrations() and migrate():
        print("✅ Database migrations completed successfully")
    else:
        print("❌ Database migrations failed")
        return False
    
    # Create superuser
    print("\n=== Creating superuser ===")
    create_superuser()
    
    # Optional: Seed data
    # print("\n=== Seeding initial data ===")
    # seed_data()
    
    print("\nAll database operations completed.")
    return True

if __name__ == '__main__':
    sys.exit(0 if main() else 1)