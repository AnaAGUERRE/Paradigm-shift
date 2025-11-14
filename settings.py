from os import environ

SESSION_CONFIGS = [
    dict(
        name='flowerfieldtask',
        display_name='Flower Field Task (independent)',
        app_sequence=['flowerfieldtask'],
        num_demo_participants=1,
    ),
]

SESSION_CONFIG_DEFAULTS = dict(
    real_world_currency_per_point=1.00,
    participation_fee=0.00,
    doc="",
)

PARTICIPANT_FIELDS = ['total_earnings']
SESSION_FIELDS = []
ROOMS = []

LANGUAGE_CODE = 'en'
REAL_WORLD_CURRENCY_CODE = 'GBP'
USE_POINTS = True

ADMIN_USERNAME = 'admin'
ADMIN_PASSWORD = '1234'  # ou via environ

SECRET_KEY = '7550954140615'