import {
  // downloadBookmark,
  // downloadKeyword,
  downloadUser,
} from './src'
import { debug_config, displayAllConfigs, download_config, network_config, user_config } from './src/configs'
import { DEFAULT_STORE_PATH } from './src/utils/constants.ts'
import { ensurePath } from './src/utils/ensurePath.ts'

async function bootstrap() {
  network_config.proxy = {}

  debug_config.verbose = true
  debug_config.show_error = false

  user_config.user_id = '71393549'
  user_config.cookie = `_ga_ZPL8LPMDK3=GS1.1.1732525713.1.1.1732525714.0.0.0; first_visit_datetime_pc=2024-11-26%2023%3A42%3A13; p_ab_id=2; p_ab_id_2=8; p_ab_d_id=657968181; yuid_b=IzBINyE; privacy_policy_agreement=7; privacy_policy_notification=0; a_type=0; b_type=1; _im_vid=01JDVHX7V4F9H10AXBK1045D3C; _im_uid.3929=i.Db5hDFzxSnKbwSLXX1iTng; FCNEC=%5B%5B%22AKsRol9uG-5Mp6kJtutD9JnUbc4j-Ef_UOQsx-RexXjWpWCnDjEqmKQx9msnBi930hX95t9_F1M7cG-Tf_XN0SzTI1MPXjhaQV9utKWaJZDLlco5pK9ajZwAJg6FaXfXXInN2UP04FMb6zH2YF2BUA1kgv2_Mb6D8g%3D%3D%22%5D%5D; __utmv=235335808.|3=plan=normal=1^5=gender=male=1^6=user_id=71393549=1^11=lang=zh=1; c_type=22; __utmz=235335808.1733883598.6.2.utmcsr=127.0.0.1:2408|utmccn=(referral)|utmcmd=referral|utmcct=/; __utma=235335808.2040747348.1732525714.1734069125.1734505857.9; jp1_ad_freq={}; first_visit_datetime=2025-01-23%2022%3A58%3A09; street_tutorial=1; PHPSESSID=71393549_mSx1695HlQVyekTZaX9q7YITEz5bS5gf; _ga_MZ1NL4PHH0=GS1.1.1737773011.4.0.1737773011.0.0.0; login_ever=yes; _ga_3WKBFJLFCP=GS1.1.1737773025.1.0.1737773028.0.0.0; cto_bundle=N3_2XV9RaWI0Rmh5WGxxRmpuJTJCaWpBd3dLRkl2cHE4ek5tM3V1WTZmdzNiWm02VWNZeWJXMDlJekw5WnIyJTJCQTBkZkdHUVgwbkdLbkIxM2ppZ1c2c21OdDZpTDJoNkFlV3hGdUhlS1dXT1l6aUpDNUQ5eW96UzZFUUFlaG9YYjhhb0cwcEwlMkJ4V21iVUZyYXYxajJLOEY0S1NlaFElM0QlM0Q; cto_bidid=wrbD4V9RejY1dndMMWxXdEJUd3clMkZoOVhRaklLMktHY1MxalpHSGNNJTJCYXVwZUViUSUyQk1aWm5YTWREZlEzcmd4MFRSeHRNeU1ETnpUNWx0RWhJbSUyRjlXbXQlMkJseVh3TG1qNW10dXh0blNrbmZUVGhhdHMlM0Q; gam_ad_freq={"1490":[3,1743846219297]}; gam_et_freq={"2628":[0,1743781419307]}; _ga=GA1.2.2040747348.1732525714; _ga_75BBYNYN9J=GS1.1.1743852498.45.1.1743854224.0.0.0; jp1_et_freq={"1490":[0,1745073235425],"3209":[0,1745073263915],"3994":[0,1745073253831]}; __cf_bm=IN826QQ_9q_Q1j8hjIlkGJ_Wel6TnOuBYxUN.GOYcZQ-1746192379-1.0.1.1-VoQ9bCtDuyBOShL096ZuT134JE2A4pSC3JUL.eqh4DkIbpsWZAdDhh8WH1.eMtxMSdTLSg61G.g1NTaaXJCLcAfG0vgrhv._Q4EZ.u8V9PzyOHKNcLXvn6j8p9ciE4eN; __bnc_pfpuid__=16vr-A5IUk2yVl0; cf_clearance=c93nOJLRK.ag0SuTQo7HS547jjKu9HVk0JFV4pF74sI-1746193166-1.2.1.1-sEs79trAhWIstXs3N_ac5VEoXMzbNHo3YJlUh7XJfKZUM1nxbYDYLLtYazUO.UrLt64QmBCEfa74m2djiPCOJIfYhV3xhifacM1vU8O8Z2QpGiFqgVQCh2iSDXLVcTPiLJhUjusZhrJCKZq8oQioZF_JS9nByuWIU.0zTi2vK_xUXcyDFTr7EraNAZK.HhvDyq.zMD7jPWnnmYwaAndJofF4zHSn25HrxrjDwiyZST2YNhB.tefot8Vr6gpXYBpEDVH9sYybjHpAkBJcKITJuOPGMYlzQaqgeVwVdRZnYg3zjNTUhTA1JH9163Eb2r3FvaId75Nwu__jdsBx8Kt2H1hTrupZyDQBR5dvEGCNhWM`

  download_config.store_path = `${DEFAULT_STORE_PATH}`
  download_config.with_tag = false

  displayAllConfigs()

  await ensurePath(download_config.store_path)

  await downloadUser({ artistId: '90204712' })
}

bootstrap()
