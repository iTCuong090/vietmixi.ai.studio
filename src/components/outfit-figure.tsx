"use client";

import { useId, type Ref } from "react";
import { getGarment, getPalette } from "@/lib/catalog";
import type { OutfitConfig } from "@/lib/types";

interface OutfitFigureProps {
  config: OutfitConfig;
  className?: string;
  svgRef?: Ref<SVGSVGElement>;
  showBackground?: boolean;
  title?: string;
  jewelry?: {
    kieng?: boolean;
    xatich?: boolean;
    bangles?: boolean;
  };
}

function mix(hex: string, target: string, amount: number) {
  const channels = [1, 3, 5].map((position) =>
    Math.round(
      parseInt(hex.slice(position, position + 2), 16) * (1 - amount) +
        parseInt(target.slice(position, position + 2), 16) * amount,
    ),
  );
  return `#${channels.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

/** The same self-contained SVG is used in the studio, lookbooks and PNG export. */
export function OutfitFigure({
  config,
  className,
  svgRef,
  showBackground = false,
  title,
  jewelry,
}: OutfitFigureProps) {
  const isAoCham = config.garment === "ao-cham";
  const activeHeritage = config.heritageAccessories ?? (
    isAoCham
      ? ["cham-khan", "cham-kieng", "cham-xatich", "cham-vong"]
      : []
  );
  const hasH = (key: string) => activeHeritage.includes(key);

  // Silver jewelry strictly restricted to Áo Chàm only!
  const showKieng = isAoCham && (hasH("cham-kieng") || (!config.heritageAccessories && !!jewelry?.kieng));
  const showXaTich = isAoCham && (hasH("cham-xatich") || (!config.heritageAccessories && !!jewelry?.xatich));
  const showBangles = isAoCham && (hasH("cham-vong") || (!config.heritageAccessories && !!jewelry?.bangles));
  const uid = useId().replace(/:/g, "");
  const id = (name: string) => `${uid}-${name}`;
  const paint = (name: string) => `url(#${id(name)})`;
  const primary = getPalette(config.primaryColor).hex;
  const accent = getPalette(config.accentColor).hex;
  const lower =
    config.garment === "tu-than"
      ? getPalette("black").hex
      : config.garment === "nhat-binh"
        ? getPalette("ivory").hex
        : accent;
  const dark = mix(primary, "#172A2A", 0.4);
  const trim = mix(accent, "#FFFFFF", 0.15);
  const skin = { light: "#E8C3A6", medium: "#CFA282", deep: "#94674D" }[config.skinTone];
  const skinShade = mix(skin, "#6E4134", 0.28);
  const male = config.avatar === "male";
  const left = male ? 155 : 163;
  const right = male ? 245 : 237;
  const waistLeft = male ? 168 : 178;
  const waistRight = male ? 232 : 222;
  const longBody = `M${left} 179 Q177 170 186 166 L214 166 Q228 171 ${right} 179 L${waistRight + 1} 260 C235 331 253 438 259 501 Q225 513 198 506 Q166 517 136 503 C150 423 167 327 ${waistLeft} 260 Z`;
  const straightBody = `M${left} 178 L185 166 L215 166 L${right} 178 L237 279 Q244 364 252 477 Q200 491 145 477 Q155 365 164 278 Z`;
  const shortBody = `M${left} 179 L184 167 L216 167 L${right} 179 L${waistRight + 3} 258 L240 330 Q220 339 199 331 Q174 341 156 329 L${waistLeft - 3} 258 Z`;
  const robeBody = `M158 179 L182 170 L217 170 L244 180 L237 299 L260 490 Q227 507 199 499 Q161 508 136 493 L163 296 Z`;
  const chamBody = `M${left} 179 L184 167 L216 167 L${right} 179 L${waistRight + 3} 262 L248 420 Q222 429 200 423 Q176 430 152 420 L${waistLeft - 3} 262 Z`;
  const tunicPath =
    config.garment === "ba-ba"
      ? shortBody
      : config.garment === "ao-cham"
        ? chamBody
        : config.garment === "ngu-than"
          ? straightBody
          : config.garment === "nhat-binh"
            ? robeBody
            : longBody;

  return (
    <svg
      ref={svgRef}
      className={className}
      viewBox="0 0 400 600"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-labelledby={id("title")}
      fill="none"
    >
      <title id={id("title")}>
        {title ??
          `${getGarment(config.garment).name}, ${getPalette(config.primaryColor).name.toLowerCase()}, bản phối minh họa thời trang`}
      </title>
      <defs>
        <linearGradient
          id={id("fabric")}
          x1="129"
          y1="230"
          x2="271"
          y2="256"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={dark} />
          <stop offset=".19" stopColor={primary} />
          <stop offset=".45" stopColor={mix(primary, "#FFFFFF", 0.18)} />
          <stop offset=".64" stopColor={primary} />
          <stop offset=".86" stopColor={mix(primary, "#FFFFFF", 0.08)} />
          <stop offset="1" stopColor={dark} />
        </linearGradient>
        <linearGradient
          id={id("accent")}
          x1="137"
          y1="330"
          x2="260"
          y2="337"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={mix(accent, "#3D3F38", 0.23)} />
          <stop offset=".24" stopColor={accent} />
          <stop offset=".42" stopColor={mix(accent, "#FFFFFF", 0.22)} />
          <stop offset=".52" stopColor={mix(accent, "#333B34", 0.12)} />
          <stop offset=".77" stopColor={accent} />
          <stop offset="1" stopColor={mix(accent, "#393D33", 0.28)} />
        </linearGradient>
        <linearGradient
          id={id("lower")}
          x1="137"
          y1="330"
          x2="260"
          y2="337"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={mix(lower, "#3D3F38", 0.23)} />
          <stop offset=".24" stopColor={lower} />
          <stop offset=".42" stopColor={mix(lower, "#FFFFFF", 0.22)} />
          <stop offset=".52" stopColor={mix(lower, "#333B34", 0.12)} />
          <stop offset=".77" stopColor={lower} />
          <stop offset="1" stopColor={mix(lower, "#393D33", 0.28)} />
        </linearGradient>
        <linearGradient
          id={id("skin")}
          x1="175"
          y1="109"
          x2="227"
          y2="118"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={skinShade} />
          <stop offset=".32" stopColor={skin} />
          <stop offset=".72" stopColor={mix(skin, "#FFF1DE", 0.17)} />
          <stop offset="1" stopColor={skinShade} />
        </linearGradient>
        <linearGradient
          id={id("hair")}
          x1="167"
          y1="89"
          x2="229"
          y2="151"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#172223" />
          <stop offset=".53" stopColor="#35403B" />
          <stop offset="1" stopColor="#182322" />
        </linearGradient>
        <linearGradient
          id={id("hat")}
          x1="154"
          y1="56"
          x2="251"
          y2="103"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F1DEAA" />
          <stop offset=".5" stopColor="#D3B777" />
          <stop offset="1" stopColor="#A48B55" />
        </linearGradient>
        <linearGradient
          id={id("paper")}
          x1="210"
          y1="250"
          x2="285"
          y2="319"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F5EDD8" />
          <stop offset="1" stopColor="#D6C3A0" />
        </linearGradient>
        <linearGradient
          id={id("silver")}
          x1="180"
          y1="160"
          x2="240"
          y2="280"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#CED7DE" />
          <stop offset=".25" stopColor="#FFFFFF" />
          <stop offset=".5" stopColor="#A8B5BE" />
          <stop offset=".8" stopColor="#E2E7EB" />
          <stop offset="1" stopColor="#8C9CA8" />
        </linearGradient>
        <radialGradient id={id("halo")}>
          <stop stopColor="#ECE8DA" />
          <stop offset="1" stopColor="#ECE8DA" stopOpacity="0" />
        </radialGradient>
        <clipPath id={id("tunic")}>
          <path d={tunicPath} />
        </clipPath>
        <g id={id("flower")}>
          <path
            d="M0 0 C-9-5-9-16-3-17 C3-18 6-9 0 0 M0 0 C4-11 14-13 17-7 C20 0 8 4 0 0 M0 0 C12 3 16 13 9 17 C2 20-1 9 0 0 M0 0 C-2 12-12 16-16 9 C-19 3-8-2 0 0"
            fill={trim}
            fillOpacity=".62"
            stroke={trim}
            strokeWidth=".55"
          />
          <circle r="3" fill={mix(accent, "#BE913D", 0.5)} />
          <circle r="1.25" fill={dark} />
        </g>
        <g id={id("sprig")} stroke={trim} strokeWidth=".9" strokeLinecap="round">
          <path d="M0 62 C-3 42 10 27 2 0" />
          <path
            d="M2 22 C-8 20-14 9-12 3 C-2 6 1 13 2 22 M3 34 C14 28 17 18 14 12 C4 16 2 25 3 34 M0 47 C-9 45-16 35-15 29 C-5 30-1 39 0 47 M0 56 C9 51 14 43 12 38 C3 40 0 48 0 56"
            fill={trim}
            fillOpacity=".32"
          />
        </g>
      </defs>

      {showBackground && (
        <g>
          <rect width="400" height="600" fill="#F3F0E6" />
          <ellipse cx="201" cy="309" rx="195" ry="248" fill={paint("halo")} />
          <path d="M62 522 V201 A138 138 0 0 1 338 201 V522" stroke="#D8D4C6" strokeWidth="1" />
          <path d="M77 522 V202 A123 123 0 0 1 323 202 V522" stroke="#E0DCCF" strokeWidth=".65" />
        </g>
      )}
      <ellipse cx="202" cy="560" rx="80" ry="9" fill="#263B36" fillOpacity=".09" />
      <ellipse cx="199" cy="559" rx="47" ry="4" fill="#263B36" fillOpacity=".065" />

      {/* Hair behind the collar, then the neck and feet. */}
      {!male && (
        <g>
          <path
            d="M176 91 Q157 119 164 160 C161 184 147 213 166 232 C170 217 183 208 181 188 L224 188 C222 207 238 221 245 228 C230 204 244 182 234 162 L230 95 Z"
            fill={paint("hair")}
          />
          <path
            d="M175 148 Q167 187 172 205 M225 148 Q232 173 230 191 M168 159 Q160 193 165 208"
            stroke="#56605A"
            strokeWidth="1"
            opacity=".5"
          />
        </g>
      )}
      <path
        d="M186 146 L185 169 Q173 176 177 184 Q199 202 223 183 Q230 176 215 169 L214 146 Z"
        fill={paint("skin")}
      />
      <path
        d="M186 149 Q201 162 214 147 L213 158 Q200 169 186 158 Z"
        fill={skinShade}
        fillOpacity=".42"
      />
      <path
        d="M168 519 L185 521 L183 548 Q177 552 164 548 Z M218 519 L234 517 L238 547 Q228 553 217 548 Z"
        fill={paint("skin")}
      />

      {/* The lower garment remains visible below and through the open tunic. */}
      {config.bottom === "trousers" ? (
        <g>
          <path
            d="M164 288 Q200 279 236 288 L247 535 Q229 542 211 536 L200 364 L190 536 Q169 542 150 535 Z"
            fill={paint("lower")}
          />
          <path
            d="M181 331 Q175 427 165 530 M218 329 Q224 422 230 532 M200 345 L199 430"
            stroke={mix(lower, "#454438", 0.2)}
            strokeWidth="1.15"
          />
          <path
            d="M174 393 L171 525 M229 418 L235 529"
            stroke="#FFFFFF"
            strokeOpacity=".18"
            strokeWidth="2"
          />
          <path
            d="M151 530 Q171 537 190 531 M211 531 Q230 537 246 530"
            stroke={mix(lower, "#3F4035", 0.18)}
            strokeWidth=".8"
          />
        </g>
      ) : (
        <g>
          <path
            d="M169 277 Q200 267 232 279 C237 359 263 462 271 532 Q200 551 128 532 C144 446 159 358 169 277 Z"
            fill={paint("lower")}
          />
          {[147, 169, 192, 214, 238, 255].map((x, index) => (
            <path
              key={x}
              d={`M${179 + index * 8} 294 Q${x + 5} 420 ${x} 533`}
              stroke={mix(lower, "#343D36", 0.2)}
              strokeWidth={index % 2 ? "1" : "1.6"}
              opacity=".7"
            />
          ))}
          <path
            d="M135 517 Q200 536 264 518 M132 526 Q200 545 268 527"
            stroke={trim}
            strokeWidth="1.1"
            opacity=".6"
          />
        </g>
      )}

      {/* Sleeve silhouettes are cut differently for the broad ceremonial robe. */}
      {config.garment === "nhat-binh" ? (
        <g>
          <path
            d="M159 179 Q144 188 139 212 L105 311 Q119 333 154 337 L174 266 L181 203 Z"
            fill={paint("fabric")}
            stroke={dark}
            strokeWidth=".7"
          />
          <path
            d="M241 180 Q258 187 263 212 L293 311 Q280 331 249 339 L229 264 L220 202 Z"
            fill={paint("fabric")}
            stroke={dark}
            strokeWidth=".7"
          />
          <path
            d="M109 297 L105 311 Q119 333 154 337 L158 323 Q126 319 109 297 M289 297 L293 311 Q280 331 249 339 L245 324 Q278 318 289 297"
            fill={paint("accent")}
          />
          <path
            d="M111 304 Q130 324 156 330 M287 304 Q271 325 247 332"
            stroke="#AB5D58"
            strokeWidth="3"
          />
          <path
            d="M109 311 Q128 330 154 334 M290 311 Q272 330 249 336"
            stroke="#799383"
            strokeWidth="2"
          />
          <path
            d="M148 210 Q150 253 124 298 M165 246 L140 309 M252 211 Q250 260 277 299 M235 248 L258 311"
            stroke={dark}
            strokeWidth="1"
            opacity=".45"
          />
        </g>
      ) : (
        <g>
          <path
            d={`M${left} 179 Q149 184 145 204 L118 310 Q126 317 141 319 L168 249 L181 193 Z`}
            fill={paint("fabric")}
            stroke={dark}
            strokeWidth=".65"
          />
          <path
            d={`M${right} 179 Q252 185 257 205 L282 311 Q273 319 259 319 L233 249 L219 193 Z`}
            fill={paint("fabric")}
            stroke={dark}
            strokeWidth=".65"
          />
          <path
            d="M122 298 L118 310 Q126 317 141 319 L145 307 Z M278 298 L282 311 Q273 319 259 319 L255 307 Z"
            fill={paint("accent")}
          />
          {config.garment === "ao-cham" && (
            <path
              d="M123 298 L145 307 M277 298 L255 307"
              stroke="#FFFFFF"
              strokeOpacity=".5"
              strokeWidth="1.2"
            />
          )}
          <path
            d="M145 216 Q143 260 132 290 M150 249 L143 269 M257 218 Q255 259 269 289 M250 249 L258 268"
            stroke={dark}
            strokeWidth="1"
            opacity=".45"
          />
          <path
            d="M148 211 L129 294 M254 210 L271 295"
            stroke="#FFFFFF"
            strokeWidth="1.3"
            strokeOpacity=".13"
          />
        </g>
      )}

      {config.garment === "tu-than" ? (
        <g>
          {/* Yếm and the two opened front panels. */}
          <path
            d="M188 174 L213 174 L231 223 L226 281 L172 281 L167 223 Z"
            fill={paint("accent")}
          />
          <path
            d="M190 176 Q201 184 212 176 M185 184 Q201 190 217 185"
            stroke={trim}
            strokeWidth="1.15"
          />
          <path
            d={`M${left} 179 L185 169 Q179 203 182 237 L198 276 Q179 337 169 494 L137 504 Q149 415 164 295 L${left} 245 Z`}
            fill={paint("fabric")}
            stroke={dark}
            strokeWidth=".7"
          />
          <path
            d={`M${right} 179 L216 169 Q221 204 218 238 L199 276 Q226 343 231 498 L260 505 Q248 414 236 295 L${right} 245 Z`}
            fill={paint("fabric")}
            stroke={dark}
            strokeWidth=".7"
          />
          <path
            d="M185 171 Q168 228 191 267 M217 171 Q235 228 207 268"
            stroke={trim}
            strokeWidth="4"
          />
          <path d="M165 266 Q201 278 237 265 L235 282 Q197 296 166 282 Z" fill={paint("accent")} />
          <path
            d="M199 278 Q168 305 181 357 L194 344 L193 290 Q220 332 221 383 L235 378 Q233 325 206 279 Z"
            fill={mix(accent, "#CFB980", 0.1)}
            stroke={mix(accent, "#333D31", 0.2)}
            strokeWidth=".6"
          />
          <path
            d="M170 321 Q157 420 149 486 M228 324 Q239 424 245 489 M196 291 Q201 313 211 330"
            stroke={dark}
            strokeWidth="1"
            opacity=".42"
          />
          <use href={`#${id("sprig")}`} transform="translate(156 424) rotate(-5) scale(.55)" />
          <use href={`#${id("sprig")}`} transform="translate(241 420) rotate(10) scale(.6)" />
        </g>
      ) : (
        <g>
          <path d={tunicPath} fill={paint("fabric")} stroke={dark} strokeWidth=".75" />
          <g clipPath={paint("tunic")}>
            {config.garment !== "ba-ba" && (
              <g opacity=".7">
                <path
                  d="M174 290 C164 362 151 433 150 502 M223 289 C228 379 246 436 247 501 M187 332 C182 407 172 470 171 513 M218 359 Q229 450 225 510"
                  stroke={dark}
                  strokeWidth="1.1"
                  opacity=".52"
                />
                <path
                  d="M180 293 Q170 419 162 495 M225 322 Q234 432 237 494 M201 380 Q198 460 201 507"
                  stroke="#FFFFFF"
                  strokeWidth="1.3"
                  strokeOpacity=".2"
                />
                <path
                  d="M179 252 Q196 262 223 251 M176 266 Q196 274 225 265"
                  stroke={dark}
                  strokeWidth=".7"
                  opacity=".42"
                />
              </g>
            )}
            {config.garment === "ao-dai" && (
              <g>
                <path
                  d="M175 485 C193 462 176 433 198 413 C224 390 208 373 222 354 M181 464 Q164 452 166 438 M193 439 Q218 440 224 425 M202 409 Q183 401 184 389"
                  stroke={trim}
                  strokeWidth="1.2"
                  opacity=".7"
                />
                <use
                  href={`#${id("sprig")}`}
                  transform="translate(192 408) rotate(-24) scale(.78)"
                />
                <use href={`#${id("flower")}`} transform="translate(191 445) scale(.9)" />
                <use
                  href={`#${id("flower")}`}
                  transform="translate(214 403) scale(.65) rotate(15)"
                />
                <use href={`#${id("flower")}`} transform="translate(222 358) scale(.55)" />
                <use href={`#${id("sprig")}`} transform="translate(218 205) rotate(25) scale(.5)" />
                <use href={`#${id("flower")}`} transform="translate(224 210) scale(.38)" />
                <path
                  d="M139 496 Q166 508 197 500 Q231 507 257 494"
                  stroke={trim}
                  strokeWidth="1"
                  opacity=".55"
                />
              </g>
            )}
            {config.garment === "ngu-than" && (
              <g opacity=".42">
                {[210, 262, 314, 366, 418, 470].map((y, row) =>
                  [172, 208, 244].map((x) => (
                    <g key={`${x}-${y}`} transform={`translate(${x - (row % 2) * 17} ${y})`}>
                      <path
                        d="M0-8 C10-8 10 8 0 8 C-10 8-10-8 0-8 Z"
                        stroke={trim}
                        strokeWidth=".8"
                      />
                      <path d="M-4 0 Q0-7 4 0 Q0 7-4 0 M0-7 V7" stroke={trim} strokeWidth=".6" />
                    </g>
                  )),
                )}
              </g>
            )}
            {config.garment === "nhat-binh" && (
              <g>
                {[270, 338, 407, 470].map((y, row) =>
                  [163, 200, 237].map((x) => (
                    <g
                      key={`${x}-${y}`}
                      transform={`translate(${x + (row % 2 ? -2 : 2)} ${y}) scale(.6)`}
                    >
                      <circle
                        r="22"
                        stroke={trim}
                        strokeWidth="1.2"
                        strokeDasharray="1 3"
                        opacity=".65"
                      />
                      <use href={`#${id("flower")}`} />
                      <path
                        d="M-21 7 Q-30-2-22-10 M21 7 Q30-2 22-10"
                        stroke={trim}
                        strokeWidth="1"
                      />
                    </g>
                  )),
                )}
                <path
                  d="M136 478 Q200 492 258 476 L260 490 Q227 507 199 499 Q161 508 136 493 Z"
                  fill={paint("accent")}
                />
                <path d="M139 486 Q201 501 258 485" stroke={dark} strokeWidth="1" />
              </g>
            )}
            {config.garment === "ba-ba" && (
              <g>
                <path
                  d="M177 221 Q184 238 175 254 M224 222 Q215 241 225 254 M170 260 Q172 274 166 290 M229 260 Q227 276 234 291"
                  stroke={dark}
                  strokeWidth="1"
                  opacity=".5"
                />
                <path
                  d="M161 289 Q174 293 186 288 L184 313 Q172 320 162 313 Z M214 288 Q226 293 237 289 L237 313 Q226 320 216 313 Z"
                  fill={primary}
                  stroke={dark}
                  strokeWidth=".8"
                />
                <path
                  d="M164 292 Q174 295 184 291 M217 292 Q227 295 235 292"
                  stroke={trim}
                  strokeWidth=".7"
                  opacity=".5"
                />
                <path
                  d="M157 325 Q173 335 194 327 M205 328 Q224 334 239 326"
                  stroke={trim}
                  strokeWidth=".7"
                  opacity=".4"
                />
              </g>
            )}
          </g>
          {config.garment === "nhat-binh" ? (
            <g>
              <path
                d="M178 174 L181 168 L191 170 L190 212 L210 212 L209 170 L219 168 L223 175 L224 230 L177 230 Z"
                fill={paint("accent")}
                stroke={dark}
                strokeWidth=".8"
              />
              <path d="M183 174 L183 222 L217 222 L216 174" stroke={primary} strokeWidth="1.5" />
              <path d="M187 174 L187 216 L213 216 L212 174" stroke={dark} strokeWidth=".7" />
              {[181, 194, 207].map((y) => (
                <g key={y}>
                  <circle cx="181" cy={y} r="1.6" fill={primary} />
                  <circle cx="219" cy={y} r="1.6" fill={primary} />
                </g>
              ))}
              <path d="M190 174 Q200 181 209 174 L209 209 L191 209 Z" fill="#E5DCC7" />
              <path d="M194 170 L199 208 L205 171" stroke="#AAA387" strokeWidth=".7" />
              <path
                d="M183 232 Q201 242 218 232 L211 248 Q200 252 188 247 Z"
                fill={paint("accent")}
              />
              <path d="M199 240 L193 303 L202 298 L208 239" fill={accent} />
              <circle cx="201" cy="236" r="3.5" fill={trim} stroke={dark} strokeWidth=".75" />
            </g>
          ) : config.garment === "ao-cham" ? (
            <g>
              {/* Stand collar */}
              <path
                d="M185 166 L185 156 Q199 163 215 156 L215 167 Q201 176 185 166 Z"
                fill={paint("fabric")}
                stroke={dark}
                strokeWidth=".8"
              />
              {/* Accent trim on collar */}
              <path
                d="M185 158 Q200 164 214 158"
                stroke={paint("accent")}
                strokeWidth="2.4"
                strokeLinecap="round"
              />
              {/* Diagonal overlap lapel with accent trim */}
              <path
                d="M200 167 Q215 186 233 218"
                stroke={dark}
                strokeWidth="2.8"
                strokeLinecap="round"
              />
              <path
                d="M200 167 Q215 186 233 218"
                stroke={paint("accent")}
                strokeWidth="2"
                strokeLinecap="round"
              />
              {/* Frog buttons along the diagonal lapel */}
              {[
                { x: 206, y: 177 },
                { x: 215, y: 191 },
                { x: 224, y: 205 },
              ].map(({ x, y }) => (
                <g key={`${x}-${y}`}>
                  <circle cx={x} cy={y} r="2.2" fill={paint("accent")} stroke={dark} strokeWidth=".8" />
                  <path d={`M${x - 3} ${y} h6`} stroke={dark} strokeWidth="1" />
                </g>
              ))}
              {/* Waist belt sash */}
              <path
                d={`M${waistLeft - 2} 258 Q200 266 ${waistRight + 2} 258 L${waistRight + 1} 275 Q200 283 ${waistLeft - 1} 275 Z`}
                fill={dark}
                stroke="#101C20"
                strokeWidth=".8"
              />
              <path
                d={`M${waistLeft} 264 Q200 272 ${waistRight} 264`}
                stroke={primary}
                strokeWidth="1.2"
                opacity=".7"
              />
              {/* Sash knot at front-right */}
              <ellipse cx="218" cy="266" rx="5.5" ry="6.5" fill={primary} stroke={dark} strokeWidth=".8" />
              {/* Hanging sash ribbon tails */}
              <path
                d="M214 270 Q210 305 212 342 L219 339 Q218 305 220 270 Z"
                fill={dark}
                stroke="#101C20"
                strokeWidth=".7"
              />
              <path
                d="M219 270 Q225 305 229 344 L236 341 Q231 300 223 270 Z"
                fill={primary}
                stroke={dark}
                strokeWidth=".7"
              />
              {/* Traditional Kiềng Bạc (solid silver torque necklace) */}
              {showKieng && (
                <g>
                  <path
                    d="M190 165 C176 166 173 184 191 187 C207 189 224 182 224 174 C224 167 212 165 208 165"
                    stroke={paint("silver")}
                    strokeWidth="3.8"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    d="M191 166 C178 167 175 183 191 186 C206 188 223 181 223 174 C223 168 211 166 208 166"
                    stroke="#FFFFFF"
                    strokeWidth="1.1"
                    strokeLinecap="round"
                    fill="none"
                    opacity=".85"
                  />
                  {/* Terminal knobs on kiềng */}
                  <circle cx="190" cy="165" r="2.2" fill={paint("silver")} stroke="#72808A" strokeWidth=".5" />
                  <circle cx="208" cy="165" r="2.2" fill={paint("silver")} stroke="#72808A" strokeWidth=".5" />
                </g>
              )}
              {/* Traditional Xà Tích (silver waist chatelaine on side hip) */}
              {showXaTich && (
                <g>
                  <circle cx="218" cy="274" r="2.2" stroke={paint("silver")} strokeWidth=".9" fill="none" />
                  <circle cx="236" cy="272" r="2.2" stroke={paint("silver")} strokeWidth=".9" fill="none" />
                  <path
                    d="M218 274 Q227 286 236 272"
                    stroke={paint("silver")}
                    strokeWidth="1.3"
                    strokeDasharray="1.5 1"
                    fill="none"
                  />
                  <path
                    d="M217 276 Q227 296 237 274"
                    stroke={paint("silver")}
                    strokeWidth="1.3"
                    strokeDasharray="1.5 1"
                    fill="none"
                  />
                  <path
                    d="M216 278 Q227 306 238 276"
                    stroke={paint("silver")}
                    strokeWidth="1.3"
                    strokeDasharray="1.5 1"
                    fill="none"
                  />
                  {/* Left drop ball */}
                  <path d="M216 278 L215 292" stroke={paint("silver")} strokeWidth="1" strokeDasharray="1 1" />
                  <circle cx="215" cy="295" r="2.2" fill={paint("silver")} stroke="#72808A" strokeWidth=".4" />
                  {/* Right tassel */}
                  <path d="M237 274 L238 290" stroke={paint("silver")} strokeWidth="1" />
                  <path d="M236 290 L240 290 L241 294 L235 294 Z" fill={paint("silver")} />
                  <path d="M236 294 L235 306 M238 294 L238 307 M240 294 L241 306" stroke={paint("silver")} strokeWidth=".9" />
                </g>
              )}
            </g>
          ) : config.garment === "ba-ba" ? (
            <g>
              <path
                d="M184 169 Q188 190 199 197 Q211 185 216 169 L210 168 Q200 177 189 168 Z"
                fill={paint("accent")}
                stroke={dark}
                strokeWidth=".6"
              />
              <path d="M199 195 L200 331" stroke={dark} strokeWidth="1.2" />
              <path d="M203 198 L204 330" stroke="#FFFFFF" strokeOpacity=".17" strokeWidth=".8" />
              {[207, 229, 251, 273, 295, 317].map((y) => (
                <circle
                  key={y}
                  cx="200"
                  cy={y}
                  r="2.1"
                  fill={accent}
                  stroke={dark}
                  strokeWidth=".6"
                />
              ))}
            </g>
          ) : (
            <g>
              <path
                d="M184 166 L184 156 Q199 162 215 156 L216 167 Q202 178 184 166 Z"
                fill={paint("fabric")}
                stroke={dark}
                strokeWidth=".8"
              />
              <path d="M185 158 Q200 164 214 158" stroke={trim} strokeWidth="1.2" />
              <path d="M215 166 Q222 186 235 193 L232 247" stroke={dark} strokeWidth="1.1" />
              <path d="M214 166 Q221 185 233 194" stroke={trim} strokeWidth=".75" />
              {[
                { x: 211, y: 168 },
                { x: 222, y: 183 },
                { x: 234, y: 197 },
                { x: 233, y: 219 },
                { x: 232, y: 241 },
              ].map(({ x, y }) => (
                <g key={y}>
                  <path d={`M${x - 3} ${y} h6`} stroke={dark} strokeWidth="1.1" />
                  <circle cx={x} cy={y} r="1.8" fill={trim} />
                </g>
              ))}
            </g>
          )}
          {/* Authentic Heritage Chest & Waist Accessories */}
          {/* 1. Áo Dài: Chuỗi Ngọc Trai Cổ */}
          {(hasH("aodai-ngoctrai") || (config.garment === "ao-dai" && hasH("ngoctrai"))) && (
            <g>
              <path
                d="M188 172 Q200 196 213 172"
                stroke="#EAE6DD"
                strokeWidth="1.2"
                fill="none"
                opacity="0.5"
              />
              {[
                { x: 187, y: 172 },
                { x: 189, y: 178 },
                { x: 192, y: 184 },
                { x: 196, y: 189 },
                { x: 200, y: 191 },
                { x: 204, y: 189 },
                { x: 208, y: 184 },
                { x: 211, y: 178 },
                { x: 213, y: 172 },
              ].map((pt, i) => (
                <g key={i}>
                  <circle cx={pt.x} cy={pt.y} r="2.8" fill="#FFFDF8" stroke="#D1CAC0" strokeWidth="0.6" />
                  <circle cx={pt.x - 0.7} cy={pt.y - 0.8} r="0.9" fill="#FFFFFF" opacity="0.9" />
                </g>
              ))}
            </g>
          )}

          {/* 2. Áo Ngũ Thân: Bội Ngọc & Thẻ Bài Cố Đô */}
          {hasH("nguthan-boingoc") && (
            <g>
              <path d="M197 178 L197 225" stroke="#B8383F" strokeWidth="1.6" />
              <circle cx="197" cy="225" r="2.2" fill="#DDB258" stroke="#876722" strokeWidth="0.5" />
              <rect x="191" y="228" width="12" height="22" rx="2" fill="#E4EFE8" stroke="#3F8265" strokeWidth="1" />
              <path d="M194 234 H200 M197 234 V242 M194 242 H200" stroke="#3F8265" strokeWidth="0.8" strokeLinecap="round" />
              <path d="M197 250 L197 268" stroke="#B8383F" strokeWidth="2.8" strokeLinecap="round" />
              <path d="M195 264 L195 272 M199 264 L199 272" stroke="#DDB258" strokeWidth="0.8" />
            </g>
          )}

          {/* 3. Áo Ngũ Thân: Dải Thắt Lưng Lụa Cố Đô */}
          {hasH("nguthan-thatlung") && (
            <g>
              <path d="M174 274 Q200 280 226 274 L226 282 Q200 288 174 282 Z" fill="#2E4A62" stroke="#182A38" strokeWidth="0.8" />
              <ellipse cx="200" cy="278" rx="5" ry="4" fill="#D4AF37" stroke="#9E7A1C" strokeWidth="0.5" />
              <path d="M197 282 Q193 315 195 345 L200 343 Q199 315 201 282 Z" fill="#2E4A62" stroke="#182A38" strokeWidth="0.6" />
              <path d="M201 282 Q205 315 204 348 L209 346 Q208 315 205 282 Z" fill="#253D52" stroke="#182A38" strokeWidth="0.6" />
            </g>
          )}

          {/* 4. Áo Tứ Thân: Dải Thắt Lưng Ngũ Sắc (Bao Lưng Xanh Đào) */}
          {hasH("tuthan-thatlung") && (
            <g>
              <path d="M172 268 Q200 274 228 268 L228 276 Q200 282 172 276 Z" fill="#6A9B7A" stroke="#3F6E4D" strokeWidth="0.8" />
              <path d="M174 274 Q200 280 226 274 L226 282 Q200 288 174 282 Z" fill="#E28997" stroke="#A84C5C" strokeWidth="0.8" />
              <path d="M176 280 Q200 286 224 280 L224 287 Q200 293 176 287 Z" fill="#E5B85C" stroke="#A67B28" strokeWidth="0.8" />
              <path d="M192 284 Q186 330 188 375 L194 372 Q192 330 197 284 Z" fill="#E28997" stroke="#A84C5C" strokeWidth="0.7" />
              <path d="M198 284 Q202 332 201 380 L207 377 Q208 332 203 284 Z" fill="#6A9B7A" stroke="#3F6E4D" strokeWidth="0.7" />
              <path d="M204 284 Q212 328 214 368 L219 365 Q217 328 209 284 Z" fill="#E5B85C" stroke="#A67B28" strokeWidth="0.7" />
            </g>
          )}

          {/* 5. Nhật Bình: Khánh Ngọc Cung Đình Ngũ Sắc */}
          {hasH("nhatbinh-khanhngoc") && (
            <g>
              <path d="M186 182 Q200 196 214 182" stroke="#DDB258" strokeWidth="1.8" fill="none" />
              <path
                d="M192 194 C190 190 196 188 200 190 C204 188 210 190 208 194 C212 198 206 204 200 202 C194 204 188 198 192 194 Z"
                fill="#E4EFE8"
                stroke="#3D7B5E"
                strokeWidth="1"
              />
              <circle cx="200" cy="196" r="2" fill="#DDB258" />
              {[
                { x: 194, color: "#2B5D88" },
                { x: 197, color: "#C93844" },
                { x: 200, color: "#E0B755" },
                { x: 203, color: "#3B7A58" },
                { x: 206, color: "#FAF6ED" },
              ].map((t, idx) => (
                <path key={idx} d={`M${t.x} 203 L${t.x} 224`} stroke={t.color} strokeWidth="1.2" />
              ))}
            </g>
          )}

          {/* 6. Áo Bà Ba: Khăn Rằn Nam Bộ buông hai vạt trước ngực */}
          {(hasH("baba-khanran") || config.accessories.head === "khan-ran") && (
            <g>
              <path d="M184 167 Q200 178 216 167 L218 173 Q200 184 182 173 Z" fill="#FAF8F5" stroke="#252A2E" strokeWidth="0.8" />
              <g>
                <path d="M181 172 Q180 230 181 305 L191 305 Q190 230 190 174 Z" fill="#FAF8F5" stroke="#252A2E" strokeWidth="0.8" />
                {[180, 195, 210, 225, 240, 255, 270, 285, 300].map((y) => (
                  <path key={y} d={`M181 ${y} L191 ${y}`} stroke="#252A2E" strokeWidth="1.5" strokeDasharray="2 1.5" />
                ))}
                {[182, 185, 188, 190].map((fx) => (
                  <path key={fx} d={`M${fx} 305 L${fx} 314`} stroke="#454D52" strokeWidth="1" />
                ))}
              </g>
              <g>
                <path d="M210 174 Q210 230 209 305 L219 305 Q220 230 219 172 Z" fill="#FAF8F5" stroke="#252A2E" strokeWidth="0.8" />
                {[180, 195, 210, 225, 240, 255, 270, 285, 300].map((y) => (
                  <path key={y} d={`M209 ${y} L219 ${y}`} stroke="#252A2E" strokeWidth="1.5" strokeDasharray="2 1.5" />
                ))}
                {[210, 213, 216, 218].map((fx) => (
                  <path key={fx} d={`M${fx} 305 L${fx} 314`} stroke="#454D52" strokeWidth="1" />
                ))}
              </g>
            </g>
          )}

          {/* 7. Áo Bà Ba: Chuỗi Hạt Gỗ Trầm */}
          {hasH("baba-chuoihat") && (
            <g>
              <path
                d="M188 172 Q200 206 212 172"
                stroke="#5C3B24"
                strokeWidth="2.8"
                strokeDasharray="3 2"
                fill="none"
              />
              <circle cx="200" cy="205" r="3" fill="#422917" stroke="#25160C" strokeWidth="0.6" />
            </g>
          )}

          {/* 8. Áo Chàm: Túi Thổ Cẩm Vùng Cao Đeo Vai */}
          {hasH("cham-tui") && (
            <g>
              <path d="M185 174 Q210 240 244 320" stroke="#8A6B3D" strokeWidth="2.8" fill="none" strokeDasharray="4 1.5" />
              <g transform="translate(230, 316)">
                <rect x="0" y="0" width="34" height="42" rx="4" fill="#254254" stroke="#122430" strokeWidth="1" />
                <rect x="0" y="8" width="34" height="12" fill="#BA5542" />
                <path d="M4 14 L10 8 L16 14 L22 8 L28 14" stroke="#F4D37A" strokeWidth="1.5" fill="none" />
                <path d="M4 14 L10 20 L16 14 L22 20 L28 14" stroke="#F4D37A" strokeWidth="1.5" fill="none" />
                <rect x="0" y="24" width="34" height="6" fill="#D98236" />
                {[4, 10, 16, 22, 28, 32].map((fx) => (
                  <path key={fx} d={`M${fx} 42 L${fx} 52`} stroke="#E6BE72" strokeWidth="1.2" />
                ))}
              </g>
            </g>
          )}
        </g>
      )}

      {/* Adult faces, with restrained ink details rather than a doll-style mask. */}
      <g>
        <path
          d={
            male
              ? "M173 111 Q169 78 197 77 Q231 75 228 115 L224 139 L213 157 Q201 167 187 157 L175 140 Z"
              : "M173 112 Q169 78 197 77 Q230 75 228 112 L224 133 Q220 152 202 160 Q184 153 177 135 Z"
          }
          fill={paint("skin")}
        />
        <path
          d="M175 113 Q166 106 169 121 Q170 131 177 131 M226 113 Q234 106 232 120 Q231 130 225 131"
          fill={skin}
          stroke={skinShade}
          strokeWidth=".6"
        />
        <path
          d="M172 119 Q170 113 173 115 M229 119 Q232 114 229 114"
          stroke={skinShade}
          strokeWidth=".7"
        />
        {male ? (
          <g>
            <path
              d="M174 119 Q168 105 170 92 Q171 74 188 72 Q204 66 220 78 Q234 87 229 111 L224 122 L221 99 Q207 100 194 87 Q185 101 178 103 L178 120 Z"
              fill={paint("hair")}
            />
            <path
              d="M178 90 Q192 75 211 83 M181 94 Q195 80 217 90 M213 91 L226 98"
              stroke="#687068"
              strokeWidth=".9"
              opacity=".45"
            />
            <path
              d="M180 113 Q187 108 193 112 M208 112 Q215 108 221 112"
              stroke="#41423A"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </g>
        ) : (
          <g>
            <path
              d="M175 124 Q165 104 170 90 Q176 69 198 71 Q226 68 232 96 Q234 111 226 126 L224 102 Q208 96 201 82 Q193 98 176 105 Z"
              fill={paint("hair")}
            />
            <path
              d="M173 100 Q192 90 198 77 M202 76 Q211 93 225 98 M171 93 Q182 77 193 77 M208 76 Q225 81 227 92"
              stroke="#69736B"
              strokeWidth=".8"
              opacity=".4"
            />
            <path
              d="M181 113 Q187 109 193 112 M208 112 Q214 108 220 112"
              stroke="#444338"
              strokeWidth="1.1"
              strokeLinecap="round"
            />
            <ellipse cx="184" cy="132" rx="6.5" ry="3" fill="#C9776B" opacity=".14" />
            <ellipse cx="218" cy="132" rx="6" ry="3" fill="#C9776B" opacity=".14" />
            <circle cx="175" cy="133" r="2" fill="#D7BB79" />
            <circle cx="227" cy="133" r="2" fill="#D7BB79" />
          </g>
        )}
        <path
          d="M180 120 Q186 115 193 120 Q187 123 180 120 M208 120 Q215 115 221 120 Q215 123 208 120"
          fill="#E9E0C9"
        />
        <path
          d="M180 120 Q186 115 193 120 M208 120 Q215 115 221 120"
          stroke="#453F35"
          strokeWidth={male ? "1" : "1.2"}
          strokeLinecap="round"
        />
        <ellipse cx="187" cy="119.4" rx="2.1" ry="2.5" fill="#3F4238" />
        <ellipse cx="214" cy="119.4" rx="2.1" ry="2.5" fill="#3F4238" />
        <circle cx="187.5" cy="118.5" r=".65" fill="#F7F0E2" />
        <circle cx="214.5" cy="118.5" r=".65" fill="#F7F0E2" />
        <path
          d="M201 119 Q199 127 198 131 Q201 134 205 131"
          stroke={skinShade}
          strokeWidth=".9"
          strokeLinecap="round"
        />
        <path d="M201 120 L202 129" stroke="#FFF1DE" strokeWidth="1" strokeOpacity=".28" />
        <path
          d="M193 141 Q197 137 201 139 Q205 137 209 140 Q201 147 193 141 Z"
          fill={male ? "#A87766" : "#AE7168"}
          opacity=".9"
        />
        <path d="M193 141 Q201 142 209 140" stroke="#88594C" strokeWidth=".6" />
        <path d="M199 145 Q203 145 205 143" stroke="#E4B29C" strokeWidth=".65" />
        <path d="M196 151 Q202 153 208 149" stroke={skinShade} strokeWidth=".6" opacity=".4" />
      </g>

      {/* Each head accessory is independently selectable. */}
      {(config.accessories.head === "khan-dong" || hasH("aodai-khandong") || hasH("nguthan-khandong")) && (
        <g>
          <path
            d="M167 91 Q158 71 175 60 Q198 45 224 59 Q242 70 233 92 Q203 78 167 91 Z"
            fill={paint("fabric")}
            stroke={dark}
            strokeWidth=".8"
          />
          {[0, 1, 2, 3].map((row) => (
            <path
              key={row}
              d={`M${167 - row * 0.3} ${86 - row * 6} Q199 ${68 - row * 6} ${233 + row * 0.2} ${86 - row * 6}`}
              stroke={trim}
              strokeWidth="1.05"
              opacity={row === 0 ? ".6" : ".26"}
            />
          ))}
          <path d="M168 88 Q199 74 232 88" stroke={dark} strokeWidth="1.2" />
        </g>
      )}
      {(config.accessories.head === "khan-van" || hasH("cham-khan")) && (
        <g>
          {/* Khăn Vấn Chàm */}
          <path
            d="M166 93 Q156 70 176 58 Q199 43 224 57 Q244 69 234 94 Q201 80 166 93 Z"
            fill={paint("fabric")}
            stroke={dark}
            strokeWidth=".8"
          />
          {/* Diagonal cross folded layers */}
          <path
            d="M167 86 Q188 77 206 94 L199 101 Q183 87 167 92 Z"
            fill={mix(primary, "#1A262C", 0.3)}
            stroke={dark}
            strokeWidth=".7"
          />
          <path
            d="M233 86 Q212 77 194 94 L201 101 Q217 87 233 92 Z"
            fill={mix(primary, "#1A262C", 0.18)}
            stroke={dark}
            strokeWidth=".7"
          />
          {/* Wrap crease folds */}
          <path d="M172 73 Q199 62 228 73" stroke={trim} strokeWidth=".9" opacity=".45" />
          <path d="M175 66 Q199 55 225 66" stroke={trim} strokeWidth=".75" opacity=".35" />
          <path d="M179 81 L200 97 L221 81" stroke={dark} strokeWidth="1.2" />
        </g>
      )}
      {(config.accessories.head === "non-la" || hasH("aodai-nonla") || hasH("baba-nonla")) && (
        <g>
          <path
            d="M151 104 Q173 156 201 168 Q229 154 251 104"
            stroke={primary}
            strokeWidth="3"
            fill="none"
          />
          <path
            d="M125 100 L199 44 L275 100 Q204 119 125 100 Z"
            fill={paint("hat")}
            stroke="#A68D59"
            strokeWidth="1"
          />
          <path
            d="M132 100 Q199 114 268 100 M144 89 Q199 101 255 90 M160 76 Q200 88 239 78 M180 61 Q199 69 219 63"
            stroke="#F4E4B6"
            strokeWidth=".85"
            opacity=".65"
          />
          {[137, 154, 176, 201, 226, 250, 266].map((x) => (
            <path key={x} d={`M199 45 L${x} 103`} stroke="#A48D5E" strokeWidth=".55" opacity=".5" />
          ))}
          <path d="M125 100 Q204 119 275 100" stroke="#9D8655" strokeWidth="2" />
        </g>
      )}
      {(config.accessories.head === "non-quai-thao" || hasH("tuthan-nonquaithao")) && (
        <g>
          <path
            d="M141 93 C139 177 139 231 165 236 C192 241 187 216 178 218 M257 92 C258 180 263 223 246 237 C227 253 214 224 226 221"
            stroke={dark}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <ellipse
            cx="200"
            cy="85"
            rx="83"
            ry="25"
            fill={paint("hat")}
            stroke="#A58B52"
            strokeWidth="1.2"
          />
          <path
            d="M117 82 L117 91 Q200 128 283 91 L283 82 Q200 112 117 82 Z"
            fill="#C7AA6D"
            stroke="#A58B52"
            strokeWidth=".8"
          />
          <ellipse
            cx="200"
            cy="78"
            rx="79"
            ry="22"
            fill={paint("hat")}
            stroke="#F0DEAC"
            strokeWidth="1.4"
          />
          {[0, 1, 2, 3, 4].map((row) => (
            <ellipse
              key={row}
              cx="200"
              cy="78"
              rx={64 - row * 10}
              ry={17 - row * 2.5}
              stroke="#A88D56"
              strokeWidth=".6"
              opacity=".65"
            />
          ))}
          <path
            d="M166 223 L169 251 M169 224 L173 248 M235 224 L231 251 M239 224 L235 250"
            stroke={dark}
            strokeWidth="1.6"
          />
        </g>
      )}

      {/* Khăn Vành Dây Hoàng Tộc (Nhật Bình) */}
      {(config.accessories.head === "khan-vanh" || hasH("nhatbinh-khanvanh")) && (
        <g>
          <ellipse cx="200" cy="74" rx="44" ry="24" fill="#1C3F5E" stroke="#0E2336" strokeWidth="1.2" />
          <ellipse cx="200" cy="72" rx="41" ry="21" fill="#245075" stroke="#D1AB57" strokeWidth="0.9" />
          <ellipse cx="200" cy="70" rx="38" ry="18" fill="#2B5D88" stroke="#D1AB57" strokeWidth="0.8" />
          <ellipse cx="200" cy="68" rx="35" ry="15" fill="#356E9E" stroke="#D1AB57" strokeWidth="0.8" />
          <path d="M166 82 Q200 70 234 82" stroke="#E5C778" strokeWidth="2.2" fill="none" />
        </g>
      )}

      {/* Trâm Cài Phượng Hoàng Mạ Vàng (Nhật Bình) */}
      {(config.accessories.head === "tram-cai" || hasH("nhatbinh-tram")) && (
        <g transform="translate(216, 52)">
          <path d="M-8 18 L18 2" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" />
          <path d="M16 2 Q24 -4 28 4 Q22 8 16 4 Z" fill="#F3D16B" stroke="#B58D21" strokeWidth="0.8" />
          <circle cx="24" cy="1" r="1.2" fill="#A8282B" />
          <path d="M16 4 L14 16" stroke="#D4AF37" strokeWidth="0.9" />
          <circle cx="14" cy="18" r="2.2" fill="#A8282B" stroke="#681517" strokeWidth="0.5" />
          <circle cx="14" cy="24" r="1.8" fill="#FFFDF8" stroke="#CFC5B6" strokeWidth="0.5" />
        </g>
      )}

      {/* Khăn Mỏ Quạ Nhung Đen (Áo Tứ Thân) */}
      {(config.accessories.head === "khan-mo-qua" || hasH("tuthan-khanmoqua")) && (
        <g>
          <path
            d="M165 92 Q158 68 178 55 Q200 46 222 55 Q242 68 235 92 Q225 64 200 58 Q175 64 165 92 Z"
            fill="#1A1C1E"
            stroke="#0E1012"
            strokeWidth="1"
          />
          <path
            d="M168 85 Q184 76 200 97 Q216 76 232 85 Q224 64 200 58 Q176 64 168 85 Z"
            fill="#24272A"
            stroke="#0E1012"
            strokeWidth="0.9"
          />
          <path d="M200 58 L200 97" stroke="#3D4247" strokeWidth="1" strokeLinecap="round" />
        </g>
      )}

      {/* Hands sit over sleeve cuffs and behind their held objects. */}
      <path
        d={
          config.garment === "nhat-binh"
            ? "M124 324 L121 340 Q118 351 123 355 L127 345 L127 361 Q131 365 133 354 L136 340 L137 330 Z"
            : "M121 310 L117 326 Q114 338 120 341 L124 330 L124 348 Q127 352 130 341 L136 320 Z"
        }
        fill={paint("skin")}
        stroke={skinShade}
        strokeWidth=".6"
      />
      <path
        d={
          config.garment === "nhat-binh"
            ? "M266 329 L271 343 Q276 353 281 348 L277 341 L286 353 Q291 351 286 344 L277 324 Z"
            : "M261 318 L263 331 Q264 342 271 342 L270 333 L278 341 Q284 342 282 336 L276 316 Z"
        }
        fill={paint("skin")}
        stroke={skinShade}
        strokeWidth=".6"
      />
      <path
        d="M127 330 L125 341 M130 330 L128 340 M272 327 L278 335"
        stroke={skinShade}
        strokeWidth=".55"
        strokeLinecap="round"
      />

      {/* Bracelets follow the exposed wrists, including the wider Nhật Bình sleeves. */}
      {(showBangles || hasH("aodai-camthach") || hasH("nguthan-camthach") || hasH("baba-vongcamthach") || hasH("nhatbinh-vongvang")) && (
        <g aria-label="Vòng tay đang đeo">
          {(config.garment === "nhat-binh"
            ? [{ x: 129, y: 337, angle: 16 }, { x: 276, y: 337, angle: -30 }]
            : [{ x: 126, y: 322, angle: 20 }, { x: 269, y: 323, angle: -18 }]
          ).map(({ x, y, angle }) => (
            <g key={x} transform={`translate(${x} ${y}) rotate(${angle})`}>
              <ellipse rx="7.4" ry="2.8" fill="none"
                stroke={showBangles ? "#718591" : hasH("nhatbinh-vongvang") ? "#99701D" : "#28634D"} strokeWidth="3.2" />
              <ellipse rx="7.4" ry="2.8" fill="none"
                stroke={showBangles ? paint("silver") : hasH("nhatbinh-vongvang") ? "#E8BC51" : "#59AC89"} strokeWidth="2.2" />
              <path d="M-6 1 Q0 4 6 1" fill="none"
                stroke={showBangles ? "#FFFFFF" : hasH("nhatbinh-vongvang") ? "#FFF0A0" : "#B6EAD4"} strokeWidth=".8" strokeLinecap="round" />
            </g>
          ))}
        </g>
      )}

      {(config.accessories.hand === "lotus" || hasH("aodai-sen")) && (
        <g>
          <path
            d="M266 365 Q272 313 287 257 M268 351 Q282 310 306 296"
            stroke="#71836A"
            strokeWidth="2"
          />
          <path
            d="M271 324 Q292 301 304 306 Q293 326 271 324"
            fill="#8B9C7B"
            stroke="#6F8167"
            strokeWidth=".7"
          />
          <path
            d="M288 268 C269 258 270 243 276 239 Q286 245 289 256 C284 239 289 226 293 224 Q302 240 296 255 C303 244 313 242 317 245 Q317 261 295 270 Z"
            fill="#D8A2A4"
            stroke="#BA8189"
            strokeWidth=".8"
          />
          <path
            d="M288 267 C278 257 282 244 287 242 Q297 251 295 264 C298 255 305 248 310 250 Q307 267 294 270 Z"
            fill="#E9C2BE"
          />
          <path
            d="M288 268 Q292 251 291 240 M290 267 Q282 260 279 249"
            stroke="#B9858B"
            strokeWidth=".65"
          />
          <path d="M302 297 Q299 285 307 279 Q315 289 309 299 Z" fill="#CA9199" />
          <path
            d="M262 331 Q268 328 275 331 L274 335 L264 336"
            fill={skin}
            stroke={skinShade}
            strokeWidth=".65"
          />
        </g>
      )}
      {(config.accessories.hand === "fan" || hasH("aodai-quat") || hasH("nguthan-quat") || hasH("tuthan-quat")) && (
        <g transform="rotate(-17 270 330)">
          <path
            d="M270 330 L225 267 Q271 239 315 268 Z"
            fill={paint("paper")}
            stroke="#B19A73"
            strokeWidth="1"
          />
          {[231, 243, 256, 269, 282, 295, 307].map((x, index) => (
            <path
              key={x}
              d={`M270 330 L${x} ${259 + Math.abs(3 - index) * 3}`}
              stroke="#AA9473"
              strokeWidth=".8"
            />
          ))}
          <path d="M239 281 Q272 261 301 282" stroke={primary} strokeWidth=".65" opacity=".7" />
          <path
            d="M252 296 Q266 274 285 293 M265 303 Q270 290 281 292"
            stroke={primary}
            strokeWidth="1"
            opacity=".65"
          />
          <path
            d="M225 267 L270 336 L315 268"
            stroke="#9C825B"
            strokeWidth="2.3"
            strokeLinecap="round"
          />
          <circle cx="270" cy="330" r="2" fill="#756543" />
          <path
            d="M267 322 Q275 320 276 327 Q273 334 266 334"
            fill={skin}
            stroke={skinShade}
            strokeWidth=".6"
          />
        </g>
      )}
      {config.accessories.hand === "tote" && (
        <g>
          <path
            d="M271 363 Q258 325 272 326 Q290 325 291 363 M282 361 Q271 328 280 328 Q296 331 301 363"
            stroke="#A49275"
            strokeWidth="4"
          />
          <path
            d="M263 357 Q286 362 308 357 L315 420 Q290 433 261 423 Z"
            fill="#D5C7AA"
            stroke="#AE9C7C"
            strokeWidth="1"
          />
          <path
            d="M267 359 L266 419 M305 360 L310 418 M270 416 Q289 423 306 416"
            stroke="#B5A384"
            strokeWidth=".7"
          />
          <path
            d="M280 394 Q284 380 291 375 Q291 389 284 394 Q296 383 301 387 Q295 400 283 400 Q275 398 273 389 Q281 389 283 397"
            fill={primary}
            opacity=".65"
          />
          <path d="M283 400 L283 407" stroke={primary} strokeWidth="1" />
          <path
            d="M269 329 Q275 326 279 330 L279 336 Q272 339 268 334 Z"
            fill={skin}
            stroke={skinShade}
            strokeWidth=".6"
          />
        </g>
      )}

      {/* Quạt Lông Công Hoàng Cung (Nhật Bình) */}
      {(config.accessories.hand === "fan-long-cong" || hasH("nhatbinh-quatlong")) && (
        <g transform="rotate(-15 270 330)">
          <path d="M270 330 L270 365" stroke="#D4AF37" strokeWidth="3" strokeLinecap="round" />
          <circle cx="270" cy="330" r="3.5" fill="#A8282B" />
          {[-30, -15, 0, 15, 30].map((angle, i) => (
            <g key={i} transform={`rotate(${angle} 270 330)`}>
              <path d="M270 330 L270 270" stroke="#255A42" strokeWidth="1.6" />
              <ellipse cx="270" cy="270" rx="10" ry="14" fill="#1C5E78" stroke="#103848" strokeWidth="0.8" />
              <ellipse cx="270" cy="272" rx="6" ry="8" fill="#E0A838" />
              <ellipse cx="270" cy="273" rx="3.5" ry="5" fill="#1A3E6E" />
            </g>
          ))}
          <path d="M266 322 Q274 320 275 327 Q272 334 265 334" fill={skin} stroke={skinShade} strokeWidth=".6" />
        </g>
      )}

      {/* Quạt Lụa Tròn Thêu Hoa (Áo Dài) */}
      {(config.accessories.hand === "fan-lua") && (
        <g transform="rotate(-15 270 330)">
          <circle cx="270" cy="275" r="28" fill="#FDFBF7" stroke="#D4AF37" strokeWidth="1.2" />
          <path d="M255 275 Q270 262 285 275" stroke="#C46B78" strokeWidth="1.8" fill="none" opacity="0.7" />
          <circle cx="270" cy="272" r="3" fill="#D98A94" />
          <path d="M270 303 L270 355" stroke="#876840" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M270 355 L270 375" stroke="#B33A44" strokeWidth="2" />
          <path d="M266 322 Q274 320 275 327 Q272 334 265 334" fill={skin} stroke={skinShade} strokeWidth=".6" />
        </g>
      )}

      {/* Giỏ Cói Lục Bình (Áo Bà Ba) */}
      {(config.accessories.hand === "gio-may" || hasH("baba-giomay")) && (
        <g>
          <path d="M272 328 Q264 290 278 290 Q292 290 286 328" stroke="#9E8055" strokeWidth="3" fill="none" />
          <path d="M260 328 L296 328 L290 372 L266 372 Z" fill="#D6C198" stroke="#87683D" strokeWidth="1" />
          {[338, 348, 358].map((y) => (
            <path key={y} d={`M262 ${y} L294 ${y}`} stroke="#BA9E70" strokeWidth="1.2" strokeDasharray="2.5 1.5" />
          ))}
          <path d="M266 322 Q274 320 275 327 Q272 334 265 334" fill={skin} stroke={skinShade} strokeWidth=".6" />
        </g>
      )}

      {/* Ruột Tượng / Túi Thơ Dân Gian (Áo Tứ Thân) */}
      {(config.accessories.hand === "tui-tho" || hasH("tuthan-tui")) && (
        <g>
          <path d="M272 328 L272 346" stroke="#9E3B46" strokeWidth="1.8" />
          <path d="M262 346 C258 344 254 360 256 372 C258 384 286 384 288 372 C290 360 286 344 282 346 Z" fill="#B83A49" stroke="#7A1D27" strokeWidth="1" />
          <circle cx="272" cy="362" r="5" fill="#E2B254" stroke="#9E7628" strokeWidth="0.6" />
          <path d="M268 382 L266 394 M272 382 L272 396 M276 382 L278 394" stroke="#E2B254" strokeWidth="1.2" />
          <path d="M266 322 Q274 320 275 327 Q272 334 265 334" fill={skin} stroke={skinShade} strokeWidth=".6" />
        </g>
      )}

      {/* Footwear, including a true no-shoe option. */}
      {config.accessories.shoes === "flats" && (
        <g>
          <path
            d="M164 539 Q169 548 182 541 L184 552 Q177 561 150 556 Q149 550 164 539 Z M216 541 Q228 547 236 537 L250 550 Q254 556 244 557 L218 556 Z"
            fill={dark}
            stroke="#34413A"
            strokeWidth=".7"
          />
          <path
            d="M152 553 Q168 557 183 551 M218 552 Q237 556 249 552"
            stroke={trim}
            strokeWidth="1"
            opacity=".75"
          />
        </g>
      )}
      {/* Guốc Mộc Truyền Thống */}
      {(config.accessories.shoes === "guoc-moc" || hasH("aodai-guoc") || hasH("nguthan-guoc") || hasH("tuthan-guoc") || hasH("baba-guoc")) && (
        <g>
          <path
            d="M164 540 Q170 548 182 542 L183 552 Q174 560 150 556 Q149 550 164 540 Z M216 542 Q228 548 236 538 L250 550 Q254 556 244 557 L218 556 Z"
            fill="#B59368"
            stroke="#785B38"
            strokeWidth=".8"
          />
          <path d="M160 543 Q170 535 180 542 M220 542 Q230 535 242 543" stroke="#8B2A34" strokeWidth="3.2" fill="none" strokeLinecap="round" />
        </g>
      )}
      {/* Hài Thêu Cung Đình */}
      {(config.accessories.shoes === "hai-theu" || hasH("nhatbinh-hai")) && (
        <g>
          <path
            d="M164 539 Q169 548 182 541 L184 552 Q177 561 150 556 Q149 550 164 539 Z M216 541 Q228 547 236 537 L250 550 Q254 556 244 557 L218 556 Z"
            fill="#9E2A34"
            stroke="#68151D"
            strokeWidth=".8"
          />
          <path d="M152 552 Q168 556 182 550 M218 551 Q237 556 248 551" stroke="#E5C778" strokeWidth="1.5" />
          <path d="M149 550 Q146 545 152 544 M250 550 Q253 545 247 544" stroke="#E5C778" strokeWidth="1.5" />
        </g>
      )}
      {config.accessories.shoes === "sneakers" && (
        <g>
          <path
            d="M162 536 L184 538 L187 552 Q174 563 148 557 L148 550 Z M214 538 L236 535 L249 545 Q257 549 253 556 Q232 562 214 554 Z"
            fill="#E6E2D5"
            stroke="#A6A69A"
            strokeWidth="1"
          />
          <path
            d="M148 552 Q167 557 187 549 L187 554 Q173 563 148 558 Z M214 550 Q234 558 254 550 L254 557 Q232 564 214 555 Z"
            fill="#FAF6E9"
            stroke="#A6A69A"
            strokeWidth=".65"
          />
          <path
            d="M160 544 L173 546 M164 540 L177 543 M227 542 L239 539 M231 546 L243 542"
            stroke={primary}
            strokeWidth="1.4"
          />
          <path d="M177 540 L178 549 M219 540 L220 550" stroke={primary} strokeWidth="3.3" />
        </g>
      )}
      {config.accessories.shoes === "sandals" && (
        <g>
          <path
            d="M163 539 Q171 543 181 540 L184 554 Q167 562 150 557 L150 552 Z M218 540 Q228 544 236 537 L251 551 L251 557 Q232 562 217 555 Z"
            fill={skin}
            stroke={skinShade}
            strokeWidth=".65"
          />
          <path
            d="M151 552 Q167 557 183 551 M218 551 Q235 557 250 551"
            stroke="#80694E"
            strokeWidth="3"
          />
          <path
            d="M158 544 L169 553 L179 541 M220 542 L234 553 L241 542"
            stroke={dark}
            strokeWidth="3.8"
            strokeLinecap="round"
          />
          <path
            d="M151 557 Q167 562 184 555 M218 556 Q235 563 252 556"
            stroke="#8D7659"
            strokeWidth="1.4"
          />
        </g>
      )}
      {config.accessories.shoes === "none" && (
        <g>
          <path
            d="M164 541 Q174 548 182 543 L183 554 Q170 560 150 556 Q149 551 164 541 Z M218 544 Q230 548 235 539 L249 551 Q253 557 242 558 L218 555 Z"
            fill={skin}
            stroke={skinShade}
            strokeWidth=".7"
          />
          <path
            d="M153 551 L155 555 M157 549 L160 555 M242 550 L240 555 M246 553 L244 557"
            stroke={skinShade}
            strokeWidth=".6"
          />
        </g>
      )}
    </svg>
  );
}

export default OutfitFigure;
