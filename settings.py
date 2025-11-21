from os import environ
import os

# oTree experiment settings for Flower Field Task

SESSION_CONFIGS = [
    # Anomaly no noise config
    dict(
        name='anomaly_no_noise',                # Internal name for the session
        display_name='Anomaly no noise',        # Shown in admin
        app_sequence=['flowerfieldtask'],       # Apps to run in sequence
        num_demo_participants=1,                # Number of demo participants
        scoring_system='anomaly',               # Scoring system identifier
    ),
    dict(
        name='mm_no_noise',                     # Internal name for the session
        display_name='M&M no noise',            # Shown in admin
        app_sequence=['flowerfieldtask'],       # Apps to run in sequence
        num_demo_participants=1,                # Number of demo participants
        scoring_system='mm',                    # Scoring system identifier
    ),
    dict(
        name='anomaly_noisy',
        display_name='Anomaly noisy',
        app_sequence=['flowerfieldtask'],
        num_demo_participants=1,
        scoring_system='anomaly',
        epsilon=0.2,  # 20% noise
        noisy=True,
    ),
    dict(
        name='mm_noisy',
        display_name='M&M noisy',
        app_sequence=['flowerfieldtask'],
        num_demo_participants=1,
        scoring_system='mm',
        epsilon=0.2,  # 20% noise
        noisy=True,
    ),
]

SESSION_CONFIG_DEFAULTS = dict(
    real_world_currency_per_point=1.00,   # Conversion rate for points
    participation_fee=0.00,               # Participation fee (if any)
    doc="",                              # Optional documentation
)

PARTICIPANT_FIELDS = ['total_earnings']  # Custom fields for each participant
SESSION_FIELDS = []                      # Custom fields for each session
ROOMS = []                               # List of rooms (if used)

LANGUAGE_CODE = 'en'                     # Language for experiment
REAL_WORLD_CURRENCY_CODE = 'GBP'         # Currency code
USE_POINTS = True                        # Use points system

ADMIN_USERNAME = 'admin'                  # Admin login username
ADMIN_PASSWORD = '1234'                   # Admin password (change in production)

SECRET_KEY = '7550954140615'              # Django secret key

BASE_DIR = os.path.dirname(os.path.abspath(__file__))   # Base directory of project
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, '_static'),                  # Static files directory
]