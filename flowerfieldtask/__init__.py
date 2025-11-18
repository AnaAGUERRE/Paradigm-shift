"""
Flower Field Task — version indépendante (pas de transmission)
Main oTree app logic for the Flower Field experiment.
Handles session setup, round logic, earnings, and data export.
"""
doc = """Flower Field Task — version indépendante (pas de transmission)"""


# oTree imports and engine functions
from otree.api import *
from .engine import run_engine, calculate_points_from_growth
import json

class C(BaseConstants):
    NAME_IN_URL = 'flowerfieldtask'  # URL name for this app
    PLAYERS_PER_GROUP = None         # No grouping
    TRAINING_ROUNDS = 5              # Number of training rounds
    TEST1_ROUNDS = 1                 # Number of test1 rounds
    EXPLORATION_ROUNDS = 5           # Number of exploration rounds
    TEST2_ROUNDS = 1                 # Number of test2 rounds
    NUM_ROUNDS = TRAINING_ROUNDS + TEST1_ROUNDS + EXPLORATION_ROUNDS + TEST2_ROUNDS  # Total rounds

class Subsession(BaseSubsession):
    def creating_session(self):
        # Initialize total earnings for each participant
        for p in self.session.get_participants():
            if 'total_earnings' not in p.vars:
                p.vars['total_earnings'] = 0
        # Set cumulative earnings for each player
        for player in self.get_players():
            player.cumulative_earnings = player.participant.vars.get('total_earnings', 0)

class Group(BaseGroup):
    pass  # No group logic needed

class Player(BasePlayer):
    cumulative_earnings = models.FloatField(initial=0)  # Tracks total earnings for this player


class FlowerField(Page):
    import json
    def vars_for_template(player):
        # Pass variables to the template for display and JS logic
        player.cumulative_earnings = player.participant.vars.get('total_earnings', 0)
        # Determine phase and flower colors for this round
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
        elif player.round_number <= C.TRAINING_ROUNDS + C.TEST1_ROUNDS:
            phase = 'Test 1'
            phase_round = player.round_number - C.TRAINING_ROUNDS
            phase_total = C.TEST1_ROUNDS
            flower_colors = ['Green', 'Yellow', 'Purple', 'Red', 'Orange', 'Blue']
        elif player.round_number <= C.TRAINING_ROUNDS + C.TEST1_ROUNDS + C.EXPLORATION_ROUNDS:
            phase = 'Exploration phase'
            phase_round = player.round_number - C.TRAINING_ROUNDS - C.TEST1_ROUNDS
            phase_total = C.EXPLORATION_ROUNDS
            # Exploration rounds flower colors
            exploration_flower_types = [
                ['Green', 'Purple', 'Blue'],
                ['Green', 'Purple', 'Blue'],
                ['Green', 'Purple', 'Yellow'],
                ['Green', 'Purple', 'Yellow'],
                ['Green', 'Purple', 'Yellow']
            ]
            flower_colors = exploration_flower_types[phase_round - 1]
        else:
            phase = 'Test 2'
            phase_round = player.round_number - C.TRAINING_ROUNDS - C.TEST1_ROUNDS - C.EXPLORATION_ROUNDS
            phase_total = C.TEST2_ROUNDS
            flower_colors = ['Green', 'Yellow', 'Purple', 'Red', 'Orange', 'Blue']
        # Set phase_class for template
        if phase == 'Training phase':
            phase_class = 'training-phase-flowers'
        elif phase == 'Test 1':
            phase_class = 'test-1-flowers'
        elif phase == 'Exploration phase':
            phase_class = 'exploration-flowers'
        elif phase == 'Test 2':
            phase_class = 'test-1-flowers'
        else:
            phase_class = ''
        return dict(
            phase=phase,
            phase_round=phase_round,
            phase_total=phase_total,
            flower_colors=json.dumps(flower_colors),
            cumulative_earnings=player.cumulative_earnings,
            phase_class=phase_class
        )
    live_method = "live_method"  # Name of live method for JS communication
    template_name = 'flowerfieldtask/FlowerField.html'  # HTML template to use


    def live_method(player, data):
        # Handles live communication from JS (nutrient submission)
        if data['type'] == 'flowerSubmit':
            nutrients = data['data']
            # Run backend engine to calculate growth and points
            output = run_engine(nutrients)
            total_growth = sum(f['growth'] for f in output) / len(output)
            total_points = calculate_points_from_growth(total_growth)
            flower_scores = [f['growth'] for f in output]
            # Update participant's total earnings
            if 'total_earnings' not in player.participant.vars:
                player.participant.vars['total_earnings'] = 0
            player.participant.vars['total_earnings'] += round(total_points, 2)
            player.cumulative_earnings = player.participant.vars['total_earnings']

            # Get flower colors and phase for this round
            if player.round_number <= C.TRAINING_ROUNDS:
                round_flower_types = [
                    ['Purple', 'Orange', 'Orange', 'Orange', 'Green', 'Purple'],
                    ['Green', 'Green', 'Purple', 'Orange', 'Purple', 'Purple'],
                    ['Orange', 'Green', 'Purple', 'Orange', 'Orange', 'Green'],
                    ['Orange', 'Purple', 'Orange', 'Purple', 'Green', 'Green'],
                    ['Purple', 'Orange', 'Green', 'Green', 'Orange', 'Purple']
                ]
                flower_colors = round_flower_types[player.round_number - 1]
                phase = 'Training phase'
                display_round = player.round_number
            elif player.round_number <= C.TRAINING_ROUNDS + C.TEST1_ROUNDS:
                flower_colors = ['Green', 'Yellow', 'Purple', 'Red', 'Orange', 'Blue']
                phase = 'Test 1'
                display_round = player.round_number - C.TRAINING_ROUNDS
            elif player.round_number <= C.TRAINING_ROUNDS + C.TEST1_ROUNDS + C.EXPLORATION_ROUNDS:
                exploration_flower_types = [
                    ['Green', 'Purple', 'Blue'],
                    ['Green', 'Purple', 'Blue'],
                    ['Green', 'Purple', 'Yellow'],
                    ['Green', 'Purple', 'Yellow'],
                    ['Green', 'Purple', 'Yellow']
                ]
                phase = 'Exploration phase'
                display_round = player.round_number - C.TRAINING_ROUNDS - C.TEST1_ROUNDS
                flower_colors = exploration_flower_types[display_round - 1]
            else:
                flower_colors = ['Green', 'Yellow', 'Purple', 'Red', 'Orange', 'Blue']
                phase = 'Test 2'
                display_round = player.round_number - C.TRAINING_ROUNDS - C.TEST1_ROUNDS - C.EXPLORATION_ROUNDS

            # Store nutrient-flower combinations and flower colors for each round
            if 'nutrient_flower_history' not in player.participant.vars:
                player.participant.vars['nutrient_flower_history'] = []
            player.participant.vars['nutrient_flower_history'].append({
                'phase': phase,
                'round': display_round,
                'flower_colors': flower_colors,
                'nutrients': nutrients
            })

            # Save all entries to Excel after every round (local analysis)
            try:
                import pandas as pd
                import os
                # Prepare the new entry for Excel
                new_entry = {
                    'participant_code': player.participant.code,
                    'phase': phase,
                    'round': display_round,
                    'flower_colors': flower_colors,
                    'nutrients': nutrients
                }
                excel_path = 'nutrient_flower_data.xlsx'
                if os.path.exists(excel_path):
                    df_existing = pd.read_excel(excel_path)
                    df_new = pd.DataFrame([new_entry])
                    df_all = pd.concat([df_existing, df_new], ignore_index=True)
                else:
                    df_all = pd.DataFrame([new_entry])
                df_all.to_excel(excel_path, index=False)

                # Auto-adjust column widths for readability
                from openpyxl import load_workbook
                wb = load_workbook(excel_path)
                ws = wb.active
                for col in ws.columns:
                    max_length = 0
                    column = col[0].column_letter # Get the column name
                    for cell in col:
                        try:
                            cell_length = len(str(cell.value)) if cell.value is not None else 0
                            if cell_length > max_length:
                                max_length = cell_length
                        except:
                            pass
                    adjusted_width = (max_length + 2)
                    ws.column_dimensions[column].width = adjusted_width
                wb.save(excel_path)
            except Exception as e:
                pass  # Ignore file errors in production

            # Return results to JS for display
            return {
                player.id_in_group: dict(
                    total_growth=round(total_growth, 2),
                    total_points=round(total_points, 2),
                    flower_scores=flower_scores,
                    cumulative_earnings=player.cumulative_earnings
                )
            }


# Sequence of pages in the experiment
page_sequence = [FlowerField]

