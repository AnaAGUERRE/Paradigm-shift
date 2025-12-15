from otree.api import *
import json

# oTree page logic for the Flower Field Task experiment

class C(BaseConstants):
    NAME_IN_URL = 'flowerfieldtask'  # URL name for this app
    PLAYERS_PER_GROUP = None         # No groups, individual play
    NUM_ROUNDS = 12                 # 12 rounds pour couvrir toutes les phases

class Subsession(BaseSubsession):
    def creating_session(self):
        # Initialize total earnings for each participant
        for p in self.session.get_participants():
            if not hasattr(p, 'total_earnings') or p.total_earnings is None:
                p.total_earnings = 0
        # Définir le traitement (session config) pour tous les joueurs
        for player in self.get_players():
            player.treatment = self.session.config.get('name', '')

class Group(BaseGroup):
    # No group logic needed for this experiment
    pass





# Converts growth to points (customize multiplier if needed)
def calculate_points(growth):
    return round(growth * 1, 2)



# Instructions page
class Instructions(Page):
    form_model = 'player'
    form_fields = ['dummy_field']

    def is_displayed(self):
        return self.round_number == 1

    def before_next_page(self):
        self.player.phase = 'Instructions'
        self.player.treatment = self.session.config.get('name', '')
        self.player.flower_colors = 'red,blue,yellow'
        self.player.nutrient_choice = 'N1,N2'
        self.player.score_per_flower = '8,5,3'
        self.player.noise_applied = 'none,low,high'

# FlowerField page
class FlowerField(Page):
    form_model = 'player'
    form_fields = ['dummy_field']

    def is_displayed(self):
        return 1 <= self.round_number <= 11

    def before_next_page(self):
        flower_choices = ['Blue', 'Red']
        flower_colors = ['Red', 'Blue', 'Yellow']
        if 1 <= self.round_number <= 4:
            phase = 'First phase'
        elif self.round_number == 5:
            phase = 'Test 1'
        elif 6 <= self.round_number <= 10:
            phase = 'Second phase'
        elif self.round_number == 11:
            phase = 'Test 2'
        else:
            phase = 'Results'
        self.player.phase = phase
        self.player.treatment = self.session.config.get('name', '')
        self.player.flower_colors = json.dumps(flower_colors)
        self.player.nutrient_choice = json.dumps(flower_choices)
        self.player.score_per_flower = json.dumps([8, 5, 3])
        self.player.noise_applied = json.dumps(['none', 'low', 'high'])
        self.player.cumulative_earnings = 42.0

# Results page
class Results(Page):
    form_model = 'player'
    form_fields = ['dummy_field']

    def is_displayed(self):
        return self.round_number == 12

    def before_next_page(self):
        self.player.phase = 'Results'

# Survey page to collect year_of_birth and feedback
class Survey(Page):

    form_model = 'player'
    form_fields = ['birth_year', 'survey_answer1', 'survey_answer2']

    def is_displayed(self):
        return self.round_number == 12

    def before_next_page(self):
        self.player.phase = 'Survey'
        # The form fields will automatically save to the Player model fields


# Custom export function for oTree admin export
def custom_export(players):
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
        "noise_applied",
        "total_score",
        "birth_year",
        "survey_answer1",
        "survey_answer2",
    ]
    for p in players:
        # Parse flower scores and noise if stored as JSON strings
        try:
            scores = json.loads(getattr(p, 'score_per_flower', '[null,null,null]'))
        except Exception:
            scores = [None, None, None]
        try:
            noise = json.loads(getattr(p, 'noise_applied', '[null,null,null]'))
        except Exception:
            noise = [None, None, None]
        yield [
            p.participant.code,
            getattr(p, 'treatment', ''),
            getattr(p, 'phase', ''),
            getattr(p, 'round_number', ''),
            getattr(p, 'flower_colors', ''),
            getattr(p, 'nutrient_choice', ''),
            scores[0] if len(scores) > 0 else '',
            scores[1] if len(scores) > 1 else '',
            scores[2] if len(scores) > 2 else '',
            noise if isinstance(noise, str) else ','.join([str(n) for n in noise]),
            getattr(p.participant, 'total_earnings', ''),
            getattr(p, 'birth_year', ''),
            getattr(p, 'survey_answer1', ''),
            getattr(p, 'survey_answer2', ''),
        ]

page_sequence = [Instructions, FlowerField, Results, Survey]  # Sequence of pages in the experiment
