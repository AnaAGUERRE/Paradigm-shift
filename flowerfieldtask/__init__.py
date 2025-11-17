doc = """Flower Field Task — version indépendante (pas de transmission)"""

from otree.api import *
from .engine import run_engine, calculate_points_from_growth
import json

class C(BaseConstants):
    NAME_IN_URL = 'flowerfieldtask'
    PLAYERS_PER_GROUP = None
    TRAINING_ROUNDS = 5
    TEST1_ROUNDS = 1
    NUM_ROUNDS = TRAINING_ROUNDS + TEST1_ROUNDS

class Subsession(BaseSubsession):
    def creating_session(self):
        for p in self.session.get_participants():
            if 'total_earnings' not in p.vars:
                p.vars['total_earnings'] = 0
        for player in self.get_players():
            player.cumulative_earnings = player.participant.vars.get('total_earnings', 0)

class Group(BaseGroup):
    pass

class Player(BasePlayer):
    cumulative_earnings = models.FloatField(initial=0)

class FlowerField(Page):
    def vars_for_template(player):
        player.cumulative_earnings = player.participant.vars.get('total_earnings', 0)
        # Determine phase and flower colors
        if player.round_number <= C.TRAINING_ROUNDS:
            phase = 'Training phase'
            phase_round = player.round_number
            phase_total = C.TRAINING_ROUNDS
            round_flower_types = [
                ['Purple', 'Orange', 'Orange', 'Orange', 'Green', 'Purple'],
                ['Green', 'Green', 'Purple', 'Orange', 'Purple', 'Purple'],
                ['Orange', 'Green', 'Purple', 'Orange', 'Orange', 'Green'],
                ['Orange', 'Purple', 'Orange', 'Purple', 'Green', 'Green'],
                ['Purple', 'Orange', 'Green', 'Green', 'Orange', 'Purple']
            ]
            flower_colors = round_flower_types[player.round_number - 1]
        else:
            phase = 'Test 1'
            phase_round = player.round_number - C.TRAINING_ROUNDS
            phase_total = C.TEST1_ROUNDS
            flower_colors = ['Green', 'Yellow', 'Purple', 'Red', 'Orange', 'Blue']
        return dict(
            phase=phase,
            phase_round=phase_round,
            phase_total=phase_total,
            flower_colors=flower_colors,
            cumulative_earnings=player.cumulative_earnings
        )
    live_method = "live_method"
    template_name = 'flowerfieldtask/FlowerField.html'

    def live_method(player, data):
        if data['type'] == 'flowerSubmit':
            nutrients = data['data']
            output = run_engine(nutrients)
            total_growth = sum(f['growth'] for f in output) / len(output)
            total_points = calculate_points_from_growth(total_growth)
            flower_scores = [f['growth'] for f in output]
            # Accumulate total earnings for participant
            if 'total_earnings' not in player.participant.vars:
                player.participant.vars['total_earnings'] = 0
            player.participant.vars['total_earnings'] += round(total_points, 2)
            player.cumulative_earnings = player.participant.vars['total_earnings']


            # Get flower colors for this round from JS config
            # Use same logic as vars_for_template to get flower_colors
            if player.round_number <= C.TRAINING_ROUNDS:
                round_flower_types = [
                    ['Purple', 'Orange', 'Orange', 'Orange', 'Green', 'Purple'],
                    ['Green', 'Green', 'Purple', 'Orange', 'Purple', 'Purple'],
                    ['Orange', 'Green', 'Purple', 'Orange', 'Orange', 'Green'],
                    ['Orange', 'Purple', 'Orange', 'Purple', 'Green', 'Green'],
                    ['Purple', 'Orange', 'Green', 'Green', 'Orange', 'Purple']
                ]
                flower_colors = round_flower_types[player.round_number - 1]
            else:
                flower_colors = ['Green', 'Yellow', 'Purple', 'Red', 'Orange', 'Blue']

            # Determine phase and display round number
            if player.round_number <= C.TRAINING_ROUNDS:
                phase = 'Training phase'
                display_round = player.round_number
            else:
                phase = 'Test 1'
                display_round = player.round_number - C.TRAINING_ROUNDS

            # Store nutrient-flower combinations and flower colors for each round
            if 'nutrient_flower_history' not in player.participant.vars:
                player.participant.vars['nutrient_flower_history'] = []
            player.participant.vars['nutrient_flower_history'].append({
                'phase': phase,
                'round': display_round,
                'flower_colors': flower_colors,
                'nutrients': nutrients
            })

            # Optionally, write to a local file (for localhost analysis only)
            try:
                with open('nutrient_flower_data.txt', 'a', encoding='utf-8') as f:
                    f.write(json.dumps({
                        'participant_code': player.participant.code,
                        'phase': phase,
                        'round': display_round,
                        'flower_colors': flower_colors,
                        'nutrients': nutrients
                    }) + '\n')
            except Exception as e:
                pass  # Ignore file errors in production

            return {
                player.id_in_group: dict(
                    total_growth=round(total_growth, 2),
                    total_points=round(total_points, 2),
                    flower_scores=flower_scores,
                    cumulative_earnings=player.cumulative_earnings
                )
            }

page_sequence = [FlowerField]

