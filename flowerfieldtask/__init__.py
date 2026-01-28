# This file contains the main logic for the oTree app "Flower Field Task." 
# It defines the experiment's structure, player/session models, 
# and core logic for handling rounds, earnings, and data export.


# oTree imports and engine functions
from otree.api import *   # Import oTree base classes and functions
from .engine import run_engine, calculate_p_from_growth   # Import custom game logic
import json   # For handling JSON data

class C(BaseConstants):
    NAME_IN_URL = 'flowerfieldtask'  # URL name for this app
    PLAYERS_PER_GROUP = None         # No grouping (individual play)
    TRAINING_ROUNDS = 4              # Number of First Phase rounds
    TEST1_ROUNDS = 1                 # Number of Test 1 rounds
    EXPLORATION_ROUNDS = 10          # Number of Second Phase rounds (now 10)
    TEST2_ROUNDS = 1                 # Number of Test 2 rounds
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

    # Tracks total earnings for this player
    cumulative_earnings = models.FloatField(initial=0)
    test1_pending_earnings = models.FloatField(initial=0)  # Holds Test 1 earnings until Test 2
    qcm_click_sequence = models.LongStringField(blank=True, null=True, label="QCM click sequence")  # Stores the QCM click sequence as a long string (can be left blank)
    dummy_field = models.StringField(initial="ok", blank=True)

    # Fields for raw export
    treatment = models.StringField(blank=True, null=True, label="Treatment")
    phase = models.StringField(blank=True, null=True, label="Phase")
    flower_colors = models.LongStringField(blank=True, null=True, label="Flower colors (JSON)")
    nutrient_choice = models.LongStringField(blank=True, null=True, label="Nutrient choice (JSON)")
    score_per_flower = models.LongStringField(blank=True, null=True, label="Score per flower (JSON)")
    Vround = models.IntegerField(blank=True, null=True, label="Vround (variation saisonnière)")
    score_reel = models.LongStringField(blank=True, null=True, label="Score réel (JSON, bruit total)")
    noise_applied = models.LongStringField(blank=True, null=True, label="Noise (JSON)")
    exploration_flower_pairs_order = models.LongStringField(blank=True, null=True, label="Shuffled flower pairs order (JSON)")

# Instructions
class Instructions(Page):
    def is_displayed(player):
        return player.round_number == 1
    def vars_for_template(player):
        return {}
    template_name = '_templates/instructions.html'
    form_model = 'player'
    form_fields = ['dummy_field', 'qcm_click_sequence']

    def before_next_page(player, timeout_happened):
        qcm_seq = player.qcm_click_sequence
        # ...
        if qcm_seq:
            try:
                json.loads(qcm_seq)
                player.qcm_click_sequence = qcm_seq
            except Exception:
                player.qcm_click_sequence = ''

# Ensure the participant cannot resubmit a round

class FlowerField(Page):
    def is_round_submitted(player):
        # Uses participant.vars to store submission state per round
        submitted_rounds = player.participant.vars.get('submitted_rounds', set())
        return player.round_number in submitted_rounds

    def vars_for_template(player):
        # Ensure the shuffled order is set at the start of the Exploration phase for each participant
        if (
            'exploration_flower_pairs' not in player.participant.vars and
            player.round_number == C.TRAINING_ROUNDS + C.TEST1_ROUNDS + 1
        ):
            import random
            treatment = player.session.config.get('display_name', '').lower()
            if treatment == 'anomaly ct':
                exploration_flower_types = [
                    ['Blue', 'Yellow'], ['Orange', 'Purple'], ['Red', 'Blue'], ['Green', 'Orange'],
                    ['Purple', 'Purple'], ['Green', 'Green'], ['Orange', 'Orange'], ['Green', 'Green'],
                    ['Purple', 'Purple'], ['Blue', 'Blue']
                ]
            elif treatment == 'no anomaly ct':
                exploration_flower_types = [
                    ['Red', 'Yellow'], ['Green', 'Purple'], ['Purple', 'Green'], ['Green', 'Purple'],
                    ['Purple', 'Purple'], ['Green', 'Green'], ['Orange', 'Orange'], ['Orange', 'Orange'],
                    ['Blue', 'Blue'], ['Blue', 'Blue']
                ]
            elif treatment == 'anomaly no ct':
                exploration_flower_types = [
                    ['Purple', 'Green'], ['Green', 'Purple'], ['Blue', 'Orange'], ['Orange', 'Blue'],
                    ['Blue', 'Orange'], ['Orange', 'Blue'], ['Green', 'Purple'], ['Purple', 'Green'],
                    ['Green', 'Purple'], ['Red', 'Yellow']
                ]
            else:
                exploration_flower_types = [
                    ['Purple', 'Green'], ['Green', 'Purple'], ['Blue', 'Orange'], ['Orange', 'Blue'],
                    ['Blue', 'Orange'], ['Orange', 'Blue'], ['Green', 'Purple'], ['Purple', 'Green'],
                    ['Green', 'Purple'], ['Red', 'Yellow']
                ]
            pairs = exploration_flower_types.copy()
            random.shuffle(pairs)
            player.participant.vars['exploration_flower_pairs'] = pairs
            print(f"[DEBUG] Exploration flower pairs for participant {player.participant.code} (created): {pairs}")

        # ...existing code...
    def is_round_submitted(player):
        # Uses participant.vars to store submission state per round
        submitted_rounds = player.participant.vars.get('submitted_rounds', set())
        return player.round_number in submitted_rounds

    def vars_for_template(player):
        # This method prepares all the variables needed for rendering the HTML template.
    # It reconstructs the round context (phase, flower colors, etc.) for display purposes.
    # The same logic is needed in live_method to ensure consistency between what is displayed
    # and what is processed when the user submits their choices.

        # Indicates if the round has already been submitted
        submitted_rounds = player.participant.vars.get('submitted_rounds', set())
        round_submitted = player.round_number in submitted_rounds
        
        # Fixed environmental parameters per round (1-indexed)
        env_params = [
            {'temp': 18, 'rain': 5.6},
            {'temp': 21, 'rain': 6.8},
            {'temp': 15, 'rain': 7.3},
            {'temp': 23, 'rain': 8.1},
            {'temp': 22, 'rain': 10.0},
            {'temp': 14, 'rain': 4.2},
            {'temp': 17, 'rain': 8.2},
            {'temp': 19, 'rain': 11.6},
            {'temp': 20, 'rain': 12.4},
            {'temp': 16, 'rain': 13.9},
            {'temp': 18, 'rain': 9.5},
            {'temp': 19, 'rain': 7.7},
            {'temp': 21, 'rain': 9.1},
            {'temp': 16, 'rain': 6.4},
            {'temp': 22, 'rain': 11.0},
            {'temp': 24, 'rain': 9.3},
        ]
        round_index = player.round_number - 1
        temperature = env_params[round_index]['temp']
        rainfall = env_params[round_index]['rain']
       
        # Pass variables to the template for display and JS logic
        # For Test 1, show total_earnings without Test 1 reward
        # For Test 2, show total_earnings including both Test 1 and Test 2 rewards
        
        # Determine current phase
        phase = None
        if player.round_number <= C.TRAINING_ROUNDS:
            phase = 'Training phase' # First phase
        elif player.round_number <= C.TRAINING_ROUNDS + C.TEST1_ROUNDS:
            phase = 'Test 1'
        elif player.round_number <= C.TRAINING_ROUNDS + C.TEST1_ROUNDS + C.EXPLORATION_ROUNDS:
            phase = 'Exploration phase' # Second phase
        else:
            phase = 'Test 2'

        # Set cumulative earnings for the player
        player.cumulative_earnings = player.participant.vars.get('total_earnings', 0)

        # Determine phase and flower colors for this round
        treatment = player.session.config.get('display_name', '').lower()

        # Map new treatment names
        if treatment == 'anomaly ct':
            treatment_logic = 'anomaly ct'
        elif treatment == 'no anomaly ct':
            treatment_logic = 'no anomaly ct'
        elif treatment == 'anomaly no ct':
            treatment_logic = 'anomaly no ct'
        elif treatment == 'anomaly noisy':
            treatment_logic = 'anomaly ct'
        elif treatment in ['transmission correct', 'transmission m&m']:
            treatment_logic = 'anomaly ct'
        else:
            treatment_logic = treatment

        if player.round_number <= C.TRAINING_ROUNDS:
            phase = 'Training phase' # First phase
            phase_round = player.round_number
            phase_total = C.TRAINING_ROUNDS
            round_flower_types = [
                ['Purple', 'Green'],          # R1
                ['Green', 'Purple', 'Purple'],# R2
                ['Purple', 'Green', 'Green'], # R3
                ['Green', 'Purple']           # R4
            ]
            flower_colors = round_flower_types[player.round_number - 1]
            player.exploration_flower_pairs_order = None
        elif player.round_number <= C.TRAINING_ROUNDS + C.TEST1_ROUNDS:
            phase = 'Test 1'
            phase_round = player.round_number - C.TRAINING_ROUNDS
            phase_total = C.TEST1_ROUNDS
            flower_colors = ['Green', 'Yellow', 'Purple', 'Red', 'Orange', 'Blue']
            player.exploration_flower_pairs_order = None
        elif player.round_number <= C.TRAINING_ROUNDS + C.TEST1_ROUNDS + C.EXPLORATION_ROUNDS:
            phase = 'Exploration phase' # Second phase
            phase_round = player.round_number - C.TRAINING_ROUNDS - C.TEST1_ROUNDS
            phase_total = C.EXPLORATION_ROUNDS
            # Always use the shuffled pairs for this participant, initialize if missing (e.g. on refresh)
            pairs = player.participant.vars.get('exploration_flower_pairs', None)
            if not pairs:
                import random
                treatment = player.session.config.get('display_name', '').lower()
                if treatment == 'anomaly ct':
                    exploration_flower_types = [
                        ['Blue', 'Yellow'], ['Orange', 'Purple'], ['Red', 'Blue'], ['Green', 'Orange'],
                        ['Purple', 'Purple'], ['Green', 'Green'], ['Orange', 'Orange'], ['Green', 'Green'],
                        ['Purple', 'Purple'], ['Blue', 'Blue']
                    ]
                elif treatment == 'no anomaly ct':
                    exploration_flower_types = [
                        ['Red', 'Yellow'], ['Green', 'Purple'], ['Purple', 'Green'], ['Green', 'Purple'],
                        ['Purple', 'Purple'], ['Green', 'Green'], ['Orange', 'Orange'], ['Orange', 'Orange'],
                        ['Blue', 'Blue'], ['Blue', 'Blue']
                    ]
                elif treatment == 'anomaly no ct':
                    exploration_flower_types = [
                        ['Purple', 'Green'], ['Green', 'Purple'], ['Blue', 'Orange'], ['Orange', 'Blue'],
                        ['Blue', 'Orange'], ['Orange', 'Blue'], ['Green', 'Purple'], ['Purple', 'Green'],
                        ['Green', 'Purple'], ['Red', 'Yellow']
                    ]
                else:
                    exploration_flower_types = [
                        ['Purple', 'Green'], ['Green', 'Purple'], ['Blue', 'Orange'], ['Orange', 'Blue'],
                        ['Blue', 'Orange'], ['Orange', 'Blue'], ['Green', 'Purple'], ['Purple', 'Green'],
                        ['Green', 'Purple'], ['Red', 'Yellow']
                    ]
                pairs = exploration_flower_types.copy()
                random.shuffle(pairs)
                player.participant.vars['exploration_flower_pairs'] = pairs
                # Store the original shuffled order in participant.vars for export
                player.participant.vars['exploration_flower_pairs_order'] = json.dumps(pairs)
                print(f"[DEBUG] Exploration flower pairs for participant {player.participant.code} (late init): {pairs}")
            # Always use the original shuffled order for export, even if pairs was re-initialized
            player.exploration_flower_pairs_order = player.participant.vars.get('exploration_flower_pairs_order', json.dumps(pairs))
            flower_colors = pairs[phase_round - 1]
        else:
            phase = 'Test 2'
            phase_round = player.round_number - C.TRAINING_ROUNDS - C.TEST1_ROUNDS - C.EXPLORATION_ROUNDS
            phase_total = C.TEST2_ROUNDS
            flower_colors = ['Green', 'Yellow', 'Purple', 'Red', 'Orange', 'Blue']
            player.exploration_flower_pairs_order = None
        
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
        
        # Prepare previous rounds' history for first and second phases
        previous_combinations = []
        valid_flowers = ['Blue', 'Green', 'Orange', 'Purple', 'Red', 'Yellow']
        if phase in ["Training phase", "Exploration phase"]:
            history = player.participant.vars.get('nutrient_flower_history', [])
            # Only show previous rounds (not current), and only those matching the current round_flower_types
            if phase == 'Training phase':
                round_flower_types = [
                    ['Purple', 'Green'],          # R1
                    ['Green', 'Purple', 'Purple'],# R2
                    ['Purple', 'Green', 'Green'], # R3
                    ['Green', 'Purple']           # R4
                ]
            else:
                # Always use the same shuffled pairs as for the main display, initialize if missing
                pairs = player.participant.vars.get('exploration_flower_pairs', None)
                if not pairs:
                    import random
                    treatment = player.session.config.get('display_name', '').lower()
                    if treatment == 'anomaly ct':
                        exploration_flower_types = [
                            ['Blue', 'Yellow'], ['Orange', 'Purple'], ['Red', 'Blue'], ['Green', 'Orange'],
                            ['Purple', 'Purple'], ['Green', 'Green'], ['Orange', 'Orange'], ['Green', 'Green'],
                            ['Purple', 'Purple'], ['Blue', 'Blue']
                        ]
                    elif treatment == 'no anomaly ct':
                        exploration_flower_types = [
                            ['Red', 'Yellow'], ['Green', 'Purple'], ['Purple', 'Green'], ['Green', 'Purple'],
                            ['Purple', 'Purple'], ['Green', 'Green'], ['Orange', 'Orange'], ['Orange', 'Orange'],
                            ['Blue', 'Blue'], ['Blue', 'Blue']
                        ]
                    elif treatment == 'anomaly no ct':
                        exploration_flower_types = [
                            ['Purple', 'Green'], ['Green', 'Purple'], ['Blue', 'Orange'], ['Orange', 'Blue'],
                            ['Blue', 'Orange'], ['Orange', 'Blue'], ['Green', 'Purple'], ['Purple', 'Green'],
                            ['Green', 'Purple'], ['Red', 'Yellow']
                        ]
                    else:
                        exploration_flower_types = [
                            ['Purple', 'Green'], ['Green', 'Purple'], ['Blue', 'Orange'], ['Orange', 'Blue'],
                            ['Blue', 'Orange'], ['Orange', 'Blue'], ['Green', 'Purple'], ['Purple', 'Green'],
                            ['Green', 'Purple'], ['Red', 'Yellow']
                        ]
                    pairs = exploration_flower_types.copy()
                    random.shuffle(pairs)
                    player.participant.vars['exploration_flower_pairs'] = pairs
                    print(f"[DEBUG] Exploration flower pairs for participant {player.participant.code} (late init): {pairs}")
                round_flower_types = pairs
            for entry in history:
                if entry['phase'] == phase and entry['round'] < phase_round:
                    # Always use the expected flower set for this round
                    expected_flowers = round_flower_types[entry['round'] - 1] if phase == 'Training phase' and 1 <= entry['round'] <= 4 else round_flower_types[entry['round'] - 1]
                    # Use growth values for flower size
                    growths = entry.get('growths', None)
                    if not growths:
                        growths = []
                        for s in entry.get('scores', []):
                            try:
                                growths.append(float(s) / 10.0)
                            except:
                                growths.append(0.0)
                    filtered = [
                        (
                            f,
                            [f"img/Nutr{nut}.png" if nut else None for nut in (n if n is not None else [])],
                            (s if s is not None else '0'),  # per-flower earnings as string (pennies, show 0 if missing)
                            f"img/Flw{f}.png" if f is not None and f != '' and f in valid_flowers else None,
                            g,  # growth value as float (for proportional size)
                            int(18 + (g if g is not None else 0.0) * 18)  # flower_size in px (smaller base and scale)
                        )
                        for (f, n, s, g) in zip(expected_flowers, entry.get('nutrients', []), entry.get('scores', []), growths)
                        if f is not None and f != '' and f in valid_flowers
                    ]
                    previous_combinations.append({
                        'round': entry['round'],
                        'zipped': filtered
                    })
        valid_flowers = ['Purple', 'Orange', 'Green', 'Yellow', 'Red', 'Blue']
        # Centering logic for flower placement (pass count to template)
        flower_count = len(flower_colors)
        # Determine treatment for template logic
        treatment = player.session.config.get('display_name', '')
        # Example: transmitted_photo could be set in participant.vars or elsewhere
        transmitted_photo = player.participant.vars.get('transmitted_photo', None)
        
        # If round_submitted, get feedback data for this round from history
        flower_scores = None
        flower_earnings = None
        if round_submitted and phase in ["Training phase", "Exploration phase"]:
            history = player.participant.vars.get('nutrient_flower_history', [])
            for entry in history:
                if entry['phase'] == phase and entry['round'] == phase_round:
                    flower_scores = entry.get('growths', None)
                    flower_earnings = entry.get('scores', None)
                    break
        return dict(
            phase=phase,
            phase_round=phase_round,
            phase_total=phase_total,
            flower_colors=json.dumps(flower_colors),
            cumulative_earnings=player.cumulative_earnings,
            phase_class=phase_class,
            previous_combinations=previous_combinations,
            valid_flowers=valid_flowers,
            flower_count=flower_count,
            treatment=treatment,
            transmitted_photo=transmitted_photo,
            temperature=temperature,
            rainfall=rainfall,
            round_submitted=round_submitted,
            flower_scores=flower_scores,
            flower_earnings=flower_earnings
        )
    live_method = "live_method"  # Name of live method for JS communication
    template_name = 'flowerfieldtask/FlowerField.html'  # HTML template to use


    def live_method(player, data):
        # This method handles real-time communication from the browser (e.g., when the user submits their choices).
    # It must reconstruct the same round context (phase, flower colors, etc.) as vars_for_template,
    # so that the backend can correctly process and validate the user's submission.

        # Prevent resubmission if the round is already submitted
        submitted_rounds = player.participant.vars.get('submitted_rounds', set())
        if player.round_number in submitted_rounds:
            return {player.id_in_group: {"error": "Round already submitted"}}
        # Handles live communication from JS (nutrient submission)
        if data['type'] == 'flowerSubmit':
            nutrients = data['data']
            # Select scoring system from session config
            scoring_system = player.session.config.get('scoring_system', 'anomaly')
            # Use the same treatment-dependent logic as vars_for_template
            treatment = player.session.config.get('display_name', '').lower()
            # Map noisy and transmission treatments to their no-noise logic for flower sequences
            if treatment == 'anomaly noisy':
                treatment_logic = 'anomaly no noise'
            elif treatment in ['transmission correct', 'transmission m&m']:
                treatment_logic = 'anomaly no noise'
            elif treatment == 'no anomaly no noise':
                treatment_logic = 'no anomaly no noise'
            else:
                treatment_logic = treatment
            if player.round_number <= C.TRAINING_ROUNDS:
                phase = 'Training phase'
                display_round = player.round_number
                round_flower_types = [
                    ['Purple', 'Green'],          # R1
                    ['Green', 'Purple', 'Purple'],# R2
                    ['Purple', 'Green', 'Green'], # R3
                    ['Green', 'Purple']           # R4
                ]
                flower_colors = round_flower_types[player.round_number - 1]
            elif player.round_number <= C.TRAINING_ROUNDS + C.TEST1_ROUNDS:
                phase = 'Test 1'
                display_round = player.round_number - C.TRAINING_ROUNDS
                flower_colors = ['Green', 'Yellow', 'Purple', 'Red', 'Orange', 'Blue']
            elif player.round_number <= C.TRAINING_ROUNDS + C.TEST1_ROUNDS + C.EXPLORATION_ROUNDS:
                phase = 'Exploration phase'
                display_round = player.round_number - C.TRAINING_ROUNDS - C.TEST1_ROUNDS
                # Always use the original shuffled pairs for this participant
                pairs = player.participant.vars.get('exploration_flower_pairs', None)
                if not pairs:
                    # If missing (should not happen), initialize as in vars_for_template
                    import random
                    treatment = player.session.config.get('display_name', '').lower()
                    if treatment == 'anomaly ct':
                        exploration_flower_types = [
                            ['Blue', 'Yellow'], ['Orange', 'Purple'], ['Red', 'Blue'], ['Green', 'Orange'],
                            ['Purple', 'Purple'], ['Green', 'Green'], ['Orange', 'Orange'], ['Green', 'Green'],
                            ['Purple', 'Purple'], ['Blue', 'Blue']
                        ]
                    elif treatment == 'no anomaly ct':
                        exploration_flower_types = [
                            ['Red', 'Yellow'], ['Green', 'Purple'], ['Purple', 'Green'], ['Green', 'Purple'],
                            ['Purple', 'Purple'], ['Green', 'Green'], ['Orange', 'Orange'], ['Orange', 'Orange'],
                            ['Blue', 'Blue'], ['Blue', 'Blue']
                        ]
                    elif treatment == 'anomaly no ct':
                        exploration_flower_types = [
                            ['Purple', 'Green'], ['Green', 'Purple'], ['Blue', 'Orange'], ['Orange', 'Blue'],
                            ['Blue', 'Orange'], ['Orange', 'Blue'], ['Green', 'Purple'], ['Purple', 'Green'],
                            ['Green', 'Purple'], ['Red', 'Yellow']
                        ]
                    else:
                        exploration_flower_types = [
                            ['Purple', 'Green'], ['Green', 'Purple'], ['Blue', 'Orange'], ['Orange', 'Blue'],
                            ['Blue', 'Orange'], ['Orange', 'Blue'], ['Green', 'Purple'], ['Purple', 'Green'],
                            ['Green', 'Purple'], ['Red', 'Yellow']
                        ]
                    pairs = exploration_flower_types.copy()
                    random.shuffle(pairs)
                    player.participant.vars['exploration_flower_pairs'] = pairs
                    player.participant.vars['exploration_flower_pairs_order'] = json.dumps(pairs)
                    print(f"[DEBUG] Exploration flower pairs for participant {player.participant.code} (live_method init): {pairs}")
                flower_colors = pairs[display_round - 1]
            else:
                phase = 'Test 2'
                display_round = player.round_number - C.TRAINING_ROUNDS - C.TEST1_ROUNDS - C.EXPLORATION_ROUNDS
                flower_colors = ['Green', 'Yellow', 'Purple', 'Red', 'Orange', 'Blue']
           
            # Variation inter-round (linked to environmental values) pennies (per round, same for all flowers)
            round_score_variation = [0, -1, 1, 0, 1, 1, 0, -1, 1, 0, 0, -1, 0, -1, 1, -1]  # R1 to R16
            round_index = player.round_number - 1
            variation_pennies = round_score_variation[round_index] if 0 <= round_index < len(round_score_variation) else 0
            # Run backend engine to calculate growth and points
            if scoring_system == 'mm':
                output = run_engine(nutrients, flower_colors=flower_colors, scoring_system='mm')
            else:
                output = run_engine(nutrients)
            total_growth = sum(f['growth'] for f in output) / len(output)
            total_points = calculate_p_from_growth(total_growth)
            flower_scores = [f['growth'] for f in output]
            # Multiply score by 2 only for Test 1 and Test 2
            if phase in ['Test 1', 'Test 2']:
                flower_scores = [g * 2 for g in flower_scores]
            # Apply intra round noise as fixed penny adjustment (+2p, -2p, 0p)
            noise_effects = [f.get('noise') for f in output]
            flower_earnings = []
            for g, noise in zip(flower_scores, noise_effects):
                base_pennies = int(g * 10)
                if noise:
                    if noise['type'] == 'increase':
                        base_pennies += 2
                    elif noise['type'] == 'decrease':
                        base_pennies -= 2
                # Add per-round variation (inter round noise)
                earning = max(0, base_pennies + variation_pennies)
                flower_earnings.append(str(earning))
            # For total, sum as £, but only add half of the flower earnings to total_earnings
            round_earnings = sum([int(e) for e in flower_earnings]) / 2 / 100.0
            # Track noise effects for noisy configs
            noise_effects = [f.get('noise') for f in output]
            # Update participant's total earnings
            if 'total_earnings' not in player.participant.vars:
                player.participant.vars['total_earnings'] = 0.0
            if phase == 'Test 1':
                # Store Test 1 earnings but do not add to total yet (added together with Test 2)
                player.test1_pending_earnings = round_earnings
                player.participant.vars['test1_pending_earnings'] = round_earnings
                # Do not update total_earnings yet
            elif phase == 'Test 2':
                # Add both Test 1 and Test 2 earnings to total_earnings
                test1_earnings = player.participant.vars.get('test1_pending_earnings', 0.0)
                player.participant.vars['total_earnings'] = round(float(player.participant.vars['total_earnings']) + test1_earnings + round_earnings, 2)
                player.cumulative_earnings = player.participant.vars['total_earnings']
                player.participant.vars['test1_pending_earnings'] = 0.0
            else:
                # For all other phases, update as usual
                player.participant.vars['total_earnings'] = round(float(player.participant.vars['total_earnings']) + round_earnings, 2)
                player.cumulative_earnings = player.participant.vars['total_earnings']

            # --- Save all relevant fields to Player for oTree export ---
            # Mark the round as submitted
            submitted_rounds.add(player.round_number)
            player.participant.vars['submitted_rounds'] = submitted_rounds
            player.treatment = player.session.config.get('display_name', '')
            # Map phase to user-friendly label
            if phase == 'Training phase':
                player.phase = 'First phase'
            elif phase == 'Exploration phase':
                player.phase = 'Second phase'
            elif phase == 'Test 1':
                player.phase = 'Test 1'
            elif phase == 'Test 2':
                player.phase = 'Test 2'
            else:
                player.phase = phase
            player.flower_colors = json.dumps(flower_colors)
            player.nutrient_choice = json.dumps(nutrients)
            player.score_per_flower = json.dumps(flower_scores)
            player.Vround = variation_pennies
            player.score_reel = json.dumps(flower_earnings)
            player.noise_applied = json.dumps(noise_effects)
            player.cumulative_earnings = player.participant.vars['total_earnings']
            

            # Store nutrient-flower combinations and flower colors for each round
            if 'nutrient_flower_history' not in player.participant.vars:
                player.participant.vars['nutrient_flower_history'] = []
            # Ensure all lists are the same length and order as flower_colors
            n_flowers = len(flower_colors)
            safe_nutrients = (nutrients if len(nutrients) == n_flowers else [None]*n_flowers)
            safe_scores = (flower_earnings if len(flower_earnings) == n_flowers else [None]*n_flowers)
            safe_growths = (flower_scores if len(flower_scores) == n_flowers else [None]*n_flowers)
            safe_noise = (noise_effects if len(noise_effects) == n_flowers else [None]*n_flowers)
            player.participant.vars['nutrient_flower_history'].append({
                'phase': phase,
                'round': display_round,
                'flower_colors': list(flower_colors),
                'nutrients': list(safe_nutrients),
                'scores': list(safe_scores),
                'growths': list(safe_growths),
                'noise_effects': list(safe_noise)
            })

            # Return results to JS for display
            # Only after Test 2 submission, send both Test 1 and Test 2 raw data for animation
            test1_data = None
            test2_data = None
            if phase == 'Test 2':
                history = player.participant.vars.get('nutrient_flower_history', [])
                # Find the first Test 1 and the last Test 2 entries in history
                test1_entry = None
                test2_entry = None
                for entry in history:
                    if entry.get('phase') == 'Test 1' and test1_entry is None:
                        test1_entry = entry
                for entry in reversed(history):
                    if entry.get('phase') == 'Test 2' and test2_entry is None:
                        test2_entry = entry
                        break
                test1_data = dict(
                    flower_colors = test1_entry['flower_colors'] if test1_entry else [],
                    nutrients = test1_entry['nutrients'] if test1_entry else [],
                    scores = test1_entry['scores'] if test1_entry else [],
                    growths = test1_entry['growths'] if test1_entry else []
                )
                test2_data = dict(
                    flower_colors = test2_entry['flower_colors'] if test2_entry else [],
                    nutrients = test2_entry['nutrients'] if test2_entry else [],
                    scores = test2_entry['scores'] if test2_entry else [],
                    growths = test2_entry['growths'] if test2_entry else []
                )
                print("[FEEDBACK] Test 1 and Test 2 results found and sent for animation.")
            result_dict = dict(
                flower_scores=flower_scores,
                flower_earnings=flower_earnings,
                cumulative_earnings="{:.2f}".format(player.cumulative_earnings)
            )
            if phase == 'Test 2':
                result_dict['test1_data'] = test1_data
                result_dict['test2_data'] = test2_data
            return {player.id_in_group: result_dict}



# Survey page at the end
class Survey(Page):

        form_model = 'player'
        form_fields = ['year_of_birth', 'feedback']

        def before_next_page(player, timeout_happened):
            pass  

        def vars_for_template(player):
            # Years from 1940 to current year
            import datetime
            current_year = datetime.datetime.now().year
            years = list(range(current_year, 1939, -1))
            return dict(years=years)

        def is_displayed(player):
            # Only show after the last round (after Test2)
            return player.round_number == C.NUM_ROUNDS

        template_name = 'flowerfieldtask/survey.html'

# Add fields to Player model
Player.year_of_birth = models.IntegerField(blank=True, null=True, label="What is your year of birth?")
Player.feedback = models.LongStringField(blank=True, null=True, label="Do you have any feedback for us? Were there any problems? (optional)")

# Results page at the very end
class Results(Page):
    def vars_for_template(player):
        # Set phase and treatment for results row in export
        player.treatment = player.session.config.get('display_name', '')
        player.phase = 'Results'
        
        # Use the participant's total earnings (in £, formatted)
        total = player.participant.vars.get('total_earnings', 0)
        # Always provide test1_zipped and test2_zipped as empty lists for template robustness
        return dict(
            total_earnings="{:.2f}".format(total),
            test1_zipped=[],
            test2_zipped=[],
            test1_result=None,
            test2_result=None
        )
    def is_displayed(player):
        return player.round_number == C.NUM_ROUNDS
    template_name = 'flowerfieldtask/results.html'

# TestResults page to show both Test 1 and Test 2 results after Test 2
class TestResults(Page):
    def is_displayed(player):
        # Only show after Test 2 round
        return player.round_number == C.TRAINING_ROUNDS + C.TEST1_ROUNDS + C.EXPLORATION_ROUNDS + C.TEST2_ROUNDS
    def vars_for_template(player):
        # Get test1_data and test2_data from participant vars (populated after Test 2)
        history = player.participant.vars.get('nutrient_flower_history', [])
        test1_entry = None
        test2_entry = None
        for entry in history:
            if entry.get('phase') == 'Test 1' and test1_entry is None:
                test1_entry = entry
        for entry in reversed(history):
            if entry.get('phase') == 'Test 2' and test2_entry is None:
                test2_entry = entry
                break
        test1_data = dict(
            flower_colors = test1_entry['flower_colors'] if test1_entry else [],
            nutrients = test1_entry['nutrients'] if test1_entry else [],
            scores = test1_entry['scores'] if test1_entry else [],
            growths = test1_entry['growths'] if test1_entry else []
        )
        test2_data = dict(
            flower_colors = test2_entry['flower_colors'] if test2_entry else [],
            nutrients = test2_entry['nutrients'] if test2_entry else [],
            scores = test2_entry['scores'] if test2_entry else [],
            growths = test2_entry['growths'] if test2_entry else []
        )
        # Environmental parameters fixed per round (1-indexed)
        env_params = [
            {'temp': 18, 'rain': 5.6},
            {'temp': 21, 'rain': 6.8},
            {'temp': 15, 'rain': 7.3},
            {'temp': 23, 'rain': 8.1},
            {'temp': 22, 'rain': 10.0},
            {'temp': 14, 'rain': 4.2},
            {'temp': 17, 'rain': 8.2},
            {'temp': 19, 'rain': 11.6},
            {'temp': 20, 'rain': 12.4},
            {'temp': 16, 'rain': 13.9},
            {'temp': 18, 'rain': 9.5},
            {'temp': 19, 'rain': 7.7},
            {'temp': 21, 'rain': 9.1},
            {'temp': 16, 'rain': 6.4},
            {'temp': 22, 'rain': 11.0},
            {'temp': 24, 'rain': 9.3},
        ]
        # Test 1 = round 5, Test 2 = round 16 (index 4 and 15)
        test1_env = env_params[4]
        test2_env = env_params[15]
        total = player.participant.vars.get('total_earnings', 0)
        return dict(
            test1_data=json.dumps(test1_data),
            test2_data=json.dumps(test2_data),
            phase='Test Results',
            phase_round='',
            phase_total='',
            cumulative_earnings="{:.2f}".format(total),
            test1_temperature=test1_env['temp'],
            test1_rainfall=test1_env['rain'],
            test2_temperature=test2_env['temp'],
            test2_rainfall=test2_env['rain']
        )
    template_name = 'flowerfieldtask/test_results.html'

# Sequence of pages in the experiment
page_sequence = [Instructions, FlowerField, TestResults, Survey, Results]

