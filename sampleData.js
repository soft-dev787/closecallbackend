const sampleData = [
  {
    resource: "call",
    event: "call.created",
    timestamp: 1733210328,
    token: "3efeb10c32364f719a6301907c9d4032",
    data: {
      id: 2435375632,
      direct_link: "https://api.aircall.io/v1/calls/2435375632",
      direction: "outbound",
      call_uuid: "CA2049a3392a6fac657c747bf3fd8cca2c",
      status: "initial",
      missed_call_reason: null,
      started_at: 1733210327,
      answered_at: null,
      ended_at: null,
      duration: 0,
      cost: "0",
      hangup_cause: null,
      voicemail: null,
      recording: null,
      asset: null,
      raw_digits: "+61 403 270 993",
      user: {
        id: 1458749,
        direct_link: "https://api.aircall.io/v1/users/1458749",
        name: "Clysyl Joy Villarete",
        email: "scyjungg@gmail.com",
        available: false,
        availability_status: "unavailable",
        language: "en-US",
        wrap_up_time: 0,
        substatus: "always_closed",
      },
      number: {
        id: 916625,
        direct_link: "https://api.aircall.io/v1/numbers/916625",
        name: "Modern Group VIC",
        digits: "+61 489 076 070",
        country: "AU",
        time_zone: "Australia/Sydney",
        open: true,
        availability_status: "open",
        is_ivr: false,
        live_recording_activated: true,
        // messages: [Object]
      },
      archived: false,
      teams: [],
      comments: [],
      tags: [],
      ivr_options: [],
    },
  },
  {
    resource: "call",
    event: "call.ended",
    timestamp: 1733210328,
    token: "3efeb10c32364f719a6301907c9d4032",
    data: {
      id: 2435375632,
      direct_link: "https://api.aircall.io/v1/calls/2435375632",
      direction: "outbound",
      call_uuid: "CA2049a3392a6fac657c747bf3fd8cca2c",
      status: "initial",
      missed_call_reason: null,
      started_at: 1733210327,
      answered_at: null,
      ended_at: null,
      duration: 0,
      cost: "0",
      hangup_cause: null,
      voicemail: null,
      recording: null,
      asset: null,
      raw_digits: "+61 403 270 993",
      user: {
        id: 1458749,
        direct_link: "https://api.aircall.io/v1/users/1458749",
        name: "Jawwad Ahmed",
        email: "jawwadah303@gmail.com",
        available: false,
        availability_status: "unavailable",
        language: "en-US",
        wrap_up_time: 0,
        substatus: "always_closed",
      },
      number: {
        id: 916625,
        direct_link: "https://api.aircall.io/v1/numbers/916625",
        name: "Modern Group VIC",
        digits: "+61 489 076 070",
        country: "AU",
        time_zone: "Australia/Sydney",
        open: true,
        availability_status: "open",
        is_ivr: false,
        live_recording_activated: true,
        // messages: [Object]
      },
      archived: false,
      teams: [],
      comments: [],
      tags: [],
      ivr_options: [],
    },
  },
];

module.exports = { sampleData };
