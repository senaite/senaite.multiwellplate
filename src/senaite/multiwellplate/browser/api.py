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
# Copyright 2026 by it's authors.
# Some rights reserved, see README and LICENSE.

import json

from Products.Five.browser import BrowserView
from bika.lims import api
from senaite.multiwellplate import logger
from senaite.multiwellplate.utils import get_mwp_config
from senaite.multiwellplate.utils import get_analysis_data
from senaite.multiwellplate.behaviors import IPlateable
from senaite.multiwellplate.behaviors import IMultiWellPlateBehavior


class MultiWellPlateApi(BrowserView):
    """API endpoint for MultiWell Plate
    """

    def __init__(self, context, request):
        self.context = context
        self.request = request

    def __call__(self):
        data = self.request.get("BODY", "{}")
        self.data = json.loads(data)
        logger.info("[MWP] API Request: {}".format(self.data))

        method = "ajax_unknown"
        if "method" in self.data:
            method = "ajax_{}".format(self.data["method"])

        func = getattr(self, method, None)
        if func is None:
            return self.error("Invalid action", status=400)
        if not IPlateable.providedBy(self.context):
            message = "{} not implement IPlateable".format(self.context)
            return self.error(message=message)

        self.mwp = IMultiWellPlateBehavior(self.context)

        result = func()
        logger.info("[MWP] API Response: {}".format(result))
        return json.dumps(result)

    def ajax_unknown(self):
        return self.error("Invalid action", status=400)

    def error(self, message, status=500, **kw):
        """Set a JSON error object and a status to the response
        """
        self.request.response.setStatus(status)
        result = {"success": False, "errors": message}
        result.update(kw)
        return result

    def ajax_get_config(self):
        """Start config for front application
        """
        return get_mwp_config(self.context)
    
    def get_worksheet_analyses_obj(self):
        """Read plate data 
        :returns: The object of analyses for this worksheet
        :rtype: dict
        """
        analyses = {}
        for an in self.context.getAnalyses():
            an_uid = api.get_uid(an)
            analyses[an_uid] = get_analysis_data(self.mwp, an)
        return analyses

    def ajax_read_data(self):
        """Returned plate data 
        :returns: The object of multiwell plate for this worksheet
        :rtype: dict
        """
        return {"analyses": self.get_worksheet_analyses_obj()}

    def ajax_write_data(self):
        """Write plate configuration
        :returns: Result of write plate
        :rtype: dict
        """
        plate = self.data.get("data", None)
        if not plate:
            self.mwp.setMultiWellPlate([])
        data = []
        analyses = plate.get("analyses", {})
        for uid in analyses.keys():
            well_idx = analyses.get(uid).get("wellIdx")
            if not well_idx:
                continue
            data.append({
                "analysis_uid": uid,
                "well_number": int(well_idx),
            })
        self.mwp.setMultiWellPlate(data)
        return {"success": True}

    def ajax_unassign_analyses(self):
        """Unassign analyses from the worksheet
        :returns: Result of unassign 
        :rtype: dict
        """

        plate = self.data.get("data", None)

        if not plate:
            return {"success": True}
        
        analyses = plate.get("analyses", {})
        for uid in analyses.keys():
            an = api.get_object_by_uid(uid)
            if an is None:
                continue
            self.context.removeAnalysis(an)

        return { "success": True, "analyses": self.get_worksheet_analyses_obj() }