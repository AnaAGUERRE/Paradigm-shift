
"""
settings.py

Configures oTree experiment and Django project settings for the flower field task.
Handles:
- Session types and app sequence
- Currency and participation fee
- Admin credentials and secret key
- Static file locations and rooms
- Custom participant/session fields
"""

# Used by oTree and Django to set up the experiment environment.
# Controls which apps (like flowerfieldtask) are run, and how.
# Static files referenced here are used in HTML templates (e.g., images, CSS, JS)

DEBUG = False  # Disables debug mode (should be True for development, False for production)

from os import environ
import os  # For file path and environment variable handling


# oTree experiment settings for Flower Field Task

SESSION_CONFIGS = [
    # Each dict defines a session type available in oTree admin

    # Anomaly CT (was Anomaly no noise)
    dict(
        name='anomaly_ct',                # Internal name for the session
        display_name='Anomaly CT',        # Shown in admin
        app_sequence=['flowerfieldtask'], # Apps to run in sequence
        num_demo_participants=1,          # Number of demo participants
        scoring_system='anomaly',         # Scoring system identifier
    ),
    # Transmission correct
    dict(
        name='transmission_correct',
        display_name='Transmission correct',
        app_sequence=['flowerfieldtask'],
        num_demo_participants=1,
        scoring_system='anomaly',
    ),
    # Transmission M&M
    dict(
        name='transmission_mm',
        display_name='Transmission M&M',
        app_sequence=['flowerfieldtask'],
        num_demo_participants=1,
        scoring_system='anomaly',
    ),
    dict(
        name='no_anomaly_ct',                    
        display_name='No Anomaly CT',    
        app_sequence=['flowerfieldtask'],      
        num_demo_participants=1,                
        scoring_system='anomaly',               
    ),
    # Anomaly No CT (new treatment)
    dict(
        name='anomaly_no_ct',
        display_name='Anomaly No CT',
        app_sequence=['flowerfieldtask'],
        num_demo_participants=1,
        scoring_system='anomaly',
    ),
]

SESSION_CONFIG_DEFAULTS = dict(
    real_world_currency_per_point=1.00,   # Conversion rate for points
    participation_fee=0.00,               # Participation fee (if any)
    doc="",                              # Optional documentation
)


# Custom participant and session fields
PARTICIPANT_FIELDS = ['total_earnings']  # Custom fields for each participant
SESSION_FIELDS = []                      # Custom fields for each session

# Room definitions for experiment sessions
ROOMS = [
    dict(name='room1', display_name='Room 1'),
    dict(name='room2', display_name='Room 2'),
    dict(name='room3', display_name='Room 3'),
    dict(name='room4', display_name='Room 4'),
    dict(name='room5', display_name='Room 5'),
    dict(name='room6', display_name='Room 6'),
]


# Language and currency settings
LANGUAGE_CODE = 'en'                     # Language for experiment
REAL_WORLD_CURRENCY_CODE = 'GBP'         # Currency code
USE_POINTS = True                        # Use points system


# Admin credentials
ADMIN_USERNAME = 'Paradigm_Shift'           # Admin login username
ADMIN_PASSWORD = '271219'                   # Admin password


# Django secret key
SECRET_KEY = '7550954140615'              # Django secret key


# Static files directory configuration
BASE_DIR = os.path.dirname(os.path.abspath(__file__))   # Base directory of project
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, '_static'),                  # Static files directory
]