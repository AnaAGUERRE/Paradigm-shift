
"""
pages.py

Defines the oTree page sequence, page logic, and custom export for the flower field experiment.
Handles:
- Experiment constants and session setup
- Page classes for instructions, main task, results, and survey
- Custom CSV export logic for participant data
"""


# Import oTree API and json module for data handling
from otree.api import *
import json

# Constants for the experiment
class C(BaseConstants):
    NAME_IN_URL = 'flowerfieldtask'  # Name of the app for URLs
    PLAYERS_PER_GROUP = None         # No grouping; single-player task
    NUM_ROUNDS = 26                  # Total number of rounds in the experiment

# Subsession logic: runs at the start of the session
class Subsession(BaseSubsession):
    def creating_session(self):
        # Initialize participant earnings and set treatment for each player
        for p in self.session.get_participants():
            if not hasattr(p, 'total_earnings') or p.total_earnings is None:
                p.total_earnings = 0
        # Set the treatment variable for each player from session config
        for player in self.get_players():
            player.treatment = self.session.config.get('name', '')

# No group logic needed for this experiment
class Group(BaseGroup):
    pass  # No group logic needed

# Instructions page: only shown in round 1
class Instructions(Page):
    form_model = 'player'  # Model to save form data to
    form_fields = ['qcm_click_sequence']  # Field to collect from the form

    def is_displayed(self):
        # Show this page only in the first round
        return self.round_number == 1

    def before_next_page(self):
        # Save the QCM click sequence if valid JSON
        qcm_seq = self.request.POST.get('qcm_click_sequence')
        if qcm_seq:
            try:
                json.loads(qcm_seq)  # Validate JSON
                self.player.qcm_click_sequence = qcm_seq
            except Exception:
                self.player.qcm_click_sequence = ''  # Save empty if invalid

# Main task page: shown in rounds 1 to 25 (Exploration phase is now rounds 6-25)
class FlowerField(Page):
    form_model = 'player'  # Model to save form data to
    form_fields = ['qcm_click_sequence']  # Field to collect from the form

    def is_displayed(self):
        # Show this page in rounds 1 to 25
        return 1 <= self.round_number <= 25

    def before_next_page(self):
        # If qcm_click_sequence is missing, copy it from another round for export
        if not self.player.qcm_click_sequence:
            seq = None
            for p in self.player.participant.get_players():
                if getattr(p, 'qcm_click_sequence', None):
                    seq = p.qcm_click_sequence
                    break
            if seq:
                self.player.qcm_click_sequence = seq


# Results page: only shown in round 26
class Results(Page):
    form_model = 'player'  # Model to save form data to
    form_fields = []       # No form fields on this page

    def is_displayed(self):
        # Show this page only in the last round (Test 2 is now round 26)
        return self.round_number == 26

    def before_next_page(self):
        # No special logic needed here
        pass


# Survey page: only shown in round 26, collects birth year
class Survey(Page):
    form_model = 'player'  # Model to save form data to
    form_fields = ['birth_year']  # Field to collect from the form

    def before_next_page(self):
        # No special logic needed here
        pass

    def is_displayed(self):
        # Show this page only in the last round (Survey is now round 26)
        return self.round_number == 26




# Custom export function for CSV download
def custom_export(players):
    """
    Custom CSV export for participant data.
    Yields rows for each round and a summary row per participant.
    """
    # Header row for the CSV
    yield [
        "participant_code",
        "treatment",
        "phase",
        "round_number",
        "flower_colors",
        "nutrient_choice",
        "score_flower1",
        "score_flower2",
        "score_flower3",
        "total_score",
        "birth_year",
        "qcm_click_sequence",
    ]
    for p in players:
        # Parse flower scores and noise if stored as JSON strings
        try:
            scores = json.loads(getattr(p, 'score_per_flower', '[null,null,null]'))
        except Exception:
            scores = [None, None, None]
        phase = getattr(p, 'phase', '')
        round_number = getattr(p, 'round_number', '')
        # Only include feedback/birthyear in the summary row, not in phase rows
        birth_year = ''
        qcm_click_sequence = ''
        if False:  # never for phase rows
            birth_year = getattr(p, 'birth_year', '')
            qcm_click_sequence = getattr(p, 'qcm_click_sequence', '')
        # Ensure phase is 'Test 2' for round 25 (fin de l'exploration), jamais 'Results'
        if str(round_number) == '25':
            phase = 'Test 2'
        # Yield a row for each round
        yield [
            p.participant.code,
            getattr(p, 'treatment', ''),
            phase,
            round_number,
            getattr(p, 'flower_colors', ''),
            getattr(p, 'nutrient_choice', ''),
            scores[0] if len(scores) > 0 else '',
            scores[1] if len(scores) > 1 else '',
            scores[2] if len(scores) > 2 else '',
            getattr(p.participant, 'total_earnings', ''),
            birth_year,
            getattr(p, 'qcm_click_sequence', ''),
        ]

    # Add a summary row for each participant with phase 'Results' and feedback/birthyear
    if players:
        from collections import defaultdict
        # Dictionary to collect summary info for each participant
        summary_by_participant = defaultdict(lambda: {
            'participant_code': '',
            'treatment': '',
            'flower_colors': '',
            'nutrient_choice': '',
            'score_per_flower': [None, None, None],
            'total_earnings': '',
            'birth_year': '',
            'qcm_click_sequence': '',
        })
        for p in players:
            code = p.participant.code
            summary = summary_by_participant[code]
            summary['participant_code'] = code
            summary['treatment'] = getattr(p, 'treatment', '')
            summary['flower_colors'] = getattr(p, 'flower_colors', '')
            summary['nutrient_choice'] = getattr(p, 'nutrient_choice', '')
            try:
                summary['score_per_flower'] = json.loads(getattr(p, 'score_per_flower', '[null,null,null]'))
            except Exception:
                pass
            summary['total_earnings'] = getattr(p.participant, 'total_earnings', '')
            # Only take feedback/birthyear from the last round (Survey page)
            if getattr(p, 'birth_year', '') or getattr(p, 'qcm_click_sequence', ''):
                summary['birth_year'] = getattr(p, 'birth_year', '')
                summary['qcm_click_sequence'] = getattr(p, 'qcm_click_sequence', '')
        for code, summary in summary_by_participant.items():
            # Search for the QCM sequence in all rounds if missing
            qcm_seq = summary['qcm_click_sequence']
            if not qcm_seq:
                for p in players:
                    if p.participant.code == code and getattr(p, 'qcm_click_sequence', ''):
                        qcm_seq = getattr(p, 'qcm_click_sequence', '')
                        break
            # Yield the summary row for this participant
            yield [
                summary['participant_code'],
                summary['treatment'],
                'Results',  # phase
                '',  # round_number
                summary['flower_colors'],
                summary['nutrient_choice'],
                summary['score_per_flower'][0] if len(summary['score_per_flower']) > 0 else '',
                summary['score_per_flower'][1] if len(summary['score_per_flower']) > 1 else '',
                summary['score_per_flower'][2] if len(summary['score_per_flower']) > 2 else '',
                summary['total_earnings'],
                summary['birth_year'],
                qcm_seq,
            ]





