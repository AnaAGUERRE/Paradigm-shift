
from otree.api import *
import json

class C(BaseConstants):
    NAME_IN_URL = 'flowerfieldtask'
    PLAYERS_PER_GROUP = None
    NUM_ROUNDS = 12

class Subsession(BaseSubsession):
    def creating_session(self):
        for p in self.session.get_participants():
            if not hasattr(p, 'total_earnings') or p.total_earnings is None:
                p.total_earnings = 0
        for player in self.get_players():
            player.treatment = self.session.config.get('name', '')

class Group(BaseGroup):
    pass










class Instructions(Page):
    form_model = 'player'
    form_fields = ['qcm_click_sequence']

    def is_displayed(self):
        return self.round_number == 1

    def before_next_page(self):
        import json as _json
        qcm_seq = self.request.POST.get('qcm_click_sequence')
        if qcm_seq:
            try:
                _json.loads(qcm_seq)
                self.player.qcm_click_sequence = qcm_seq
            except Exception:
                self.player.qcm_click_sequence = ''

class FlowerField(Page):
    form_model = 'player'
    form_fields = ['qcm_click_sequence']

    def is_displayed(self):
        return 1 <= self.round_number <= 11

    def before_next_page(self):
        # Recopie la séquence QCM si absente (pour export)
        if not self.player.qcm_click_sequence:
            seq = None
            for p in self.player.participant.get_players():
                if getattr(p, 'qcm_click_sequence', None):
                    seq = p.qcm_click_sequence
                    break
            if seq:
                self.player.qcm_click_sequence = seq

class Results(Page):
    form_model = 'player'
    form_fields = []

    def is_displayed(self):
        return self.round_number == 12

    def before_next_page(self):
        pass

class Survey(Page):
    form_model = 'player'
    form_fields = ['birth_year']

    def before_next_page(self):
        pass

    def is_displayed(self):
        return self.round_number == 12


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
        "qcm_click_sequence",
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
        phase = getattr(p, 'phase', '')
        round_number = getattr(p, 'round_number', '')
        # Only include feedback/birthyear in the summary row, not in phase rows
        birth_year = ''
        qcm_click_sequence = ''
        if False:  # never for phase rows
            birth_year = getattr(p, 'birth_year', '')
            qcm_click_sequence = getattr(p, 'qcm_click_sequence', '')
        # Ensure phase is 'Test 2' for round 11, never 'Results'
        if str(round_number) == '11':
            phase = 'Test 2'
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
            noise if isinstance(noise, str) else ','.join([str(n) for n in noise]),
            getattr(p.participant, 'total_earnings', ''),
            birth_year,
            getattr(p, 'qcm_click_sequence', ''),
        ]

    # Add a summary row for each participant with phase 'Results' and feedback/birthyear
    if players:
        from collections import defaultdict
        summary_by_participant = defaultdict(lambda: {
            'participant_code': '',
            'treatment': '',
            'flower_colors': '',
            'nutrient_choice': '',
            'score_per_flower': [None, None, None],
            'noise_applied': [None, None, None],
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
            try:
                summary['noise_applied'] = json.loads(getattr(p, 'noise_applied', '[null,null,null]'))
            except Exception:
                pass
            summary['total_earnings'] = getattr(p.participant, 'total_earnings', '')
            # Only take feedback/birthyear from the last round (Survey page)
            if getattr(p, 'birth_year', '') or getattr(p, 'qcm_click_sequence', ''):
                summary['birth_year'] = getattr(p, 'birth_year', '')
                summary['qcm_click_sequence'] = getattr(p, 'qcm_click_sequence', '')
        for code, summary in summary_by_participant.items():
            # Cherche la séquence dans tous les rounds du participant
            qcm_seq = summary['qcm_click_sequence']
            if not qcm_seq:
                for p in players:
                    if p.participant.code == code and getattr(p, 'qcm_click_sequence', ''):
                        qcm_seq = getattr(p, 'qcm_click_sequence', '')
                        break
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
                ','.join([str(n) for n in summary['noise_applied']]) if isinstance(summary['noise_applied'], list) else summary['noise_applied'],
                summary['total_earnings'],
                summary['birth_year'],
                qcm_seq,
            ]

page_sequence = [Instructions, FlowerField, Results, Survey]  # Sequence of pages in the experiment
