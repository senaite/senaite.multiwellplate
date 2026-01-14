# -*- coding: utf-8 -*-
#
# This file is part of SENAITE.MULTIWELLPLATE.
#
# SENAITE.MULTIWELLPLATE is free software: you can redistribute it and/or
# modify it under the terms of the GNU General Public License as published
# by the Free Software Foundation, version 2.
#
# This program is distributed in the hope that it will be useful, but WITHOUT
# ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
# FOR A PARTICULAR PURPOSE. See the GNU General Public License for more
# details.
#
# You should have received a copy of the GNU General Public License along with
# this program; if not, write to the Free Software Foundation, Inc., 51
# Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
#
# Copyright 2025 by it's authors.
# Some rights reserved, see README and LICENSE.

import json

from bika.lims import api
from bika.lims.interfaces import IDuplicateAnalysis
from bika.lims.interfaces import IReferenceAnalysis
from bika.lims.interfaces import IRoutineAnalysis
from senaite.core.content.worksheet import Worksheet
from senaite.core.interfaces import IWorksheet
from zope.interface import alsoProvides

from senaite.multiwellplate import logger
from senaite.multiwellplate import is_installed
from senaite.multiwellplate.behaviors import IPlateable
from senaite.multiwellplate.behaviors import IMultiWellPlateBehavior


def implement_mwp_for_worksheet(worksheet):
    if not is_installed():
        return
    if not IWorksheet.providedBy(worksheet):
        return
    ws_template = worksheet.getWorksheetTemplate()
    if not ws_template:
        return
    if not ws_template.multiwell_enabled:
        return
    if not IPlateable.providedBy(worksheet):
        alsoProvides(worksheet, IPlateable)
        instance = IMultiWellPlateBehavior(worksheet)
        instance.setColsCount(ws_template.cols_count or 12)
        instance.setRowsCount(ws_template.rows_count or 8)
        instance.setFields(ws_template.fields or [])
        instance.setRules(ws_template.rules or [])
        instance.setMultiWellPlate([])
    return


def get_parent_title(analysis):
    is_duplicate = IDuplicateAnalysis.providedBy(analysis)
    is_routine = IRoutineAnalysis.providedBy(analysis)
    if is_duplicate or is_routine:
        parent = analysis.getRequest()
    elif IReferenceAnalysis.providedBy(analysis):
        parent = analysis.getSample()
    else:
        return ""
    return api.get_id(parent)


def get_mwp_config(worksheet):
    """Build configuration for front application from MultiWellPlate behavior
    """
    if not IPlateable.providedBy(worksheet):
        return None

    multiwellplate = IMultiWellPlateBehavior(worksheet)
    fields = {item["keyword"]: item for item in multiwellplate.getFields()}
    cols_count = int(multiwellplate.getColsCount())
    rows_count = int(multiwellplate.getRowsCount())

    config = {
        "colsCount": cols_count,
        "rowsCount": rows_count,
        "worksheetId": api.get_id(worksheet),
        "fields": fields,
        "rules": map_rules(multiwellplate.getRules(), cols_count, rows_count),
    }
    analyses = {}
    for an in worksheet.getAnalyses():
        an_uid = api.get_uid(an)
        analyses[an_uid] = get_analysis_data(multiwellplate, an)
    config["analyses"] = analyses
    return config


def get_analysis_data(multiwellplate, analysis):
    an_uid = analysis.UID()
    default_data = {
        "uid": an_uid,
        "title": api.get_title(analysis),
        "keyword": analysis.Keyword,
        "sampleId": get_parent_title(analysis),
        "sampleType": "",
        "clientId": "",
        "clientName": "",
    }
    local = {"obj": analysis}
    fields = {}
    for field in multiwellplate.getFields():
        k = field["keyword"]
        v = field["value"]
        try:
            fields[k] = eval(v, local)
        except Exception as exc:
            err = "Error evaluate parameter '{}': {}".format(k, exc)
            logger.error(err)
    default_data.update(fields)
    return {
        "wellIdx": multiwellplate.getWellNumberForAnalysis(an_uid),
        "data": default_data,
    }


def map_rules(rules, cols_count, rows_count):
    mapped_rules = {}
    for r in rules:
        header = r.get("rule_header", {})
        title = header.get("title", "")
        body = {}

        try:
            body = json.loads(r.get("rule_body", ""))
        except Exception as exc:
            err = "Error parsing the rule body: {}".format(exc)
            logger.error(err)

        wells_count = cols_count * rows_count
        default_range = "1-{}".format(wells_count)
        applies_to = header.get("applies_to", "") or default_range
      
        mapped_rules[header.get("id")] = {
            "title": title,
            "description": header.get("description", ""),
            "color": header.get("color", ""),
            "body": {
                "event": {"type": "well"},
                "name": title,
                "conditions": {
                    "all": [
                        build_applicability_precondition(applies_to),
                        body,
                    ]
                }
            }
        }
    
    return mapped_rules


def parse_numbers(applies_to):
    result = []

    for part in applies_to.split(","):
        part = part.strip()
        if "-" in part:
            start, end = part.split("-", 1)
            result.extend(range(int(start), int(end) + 1))
        else:
            result.append(int(part))

    return list(set(result))


def build_applicability_precondition(applies_to):
    applicabibility_precondition = {
        "name": "rule-applicapable-area-condition",
        "fact": "nextIdx",
        "operator": "in",
        "value": parse_numbers(applies_to),
    }

    return applicabibility_precondition
