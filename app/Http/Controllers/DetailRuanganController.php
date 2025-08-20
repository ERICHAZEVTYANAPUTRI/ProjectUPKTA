<?php

namespace App\Http\Controllers;

use App\Models\RuanganGKT;
use Illuminate\Http\Request;

class DetailRuanganController extends Controller
{
    public function show($gedungId, $roomId)
    {
        $ruangan = RuanganGKT::where('gedung', $gedungId)
            ->where('id', $roomId)
            ->first();

        if ($ruangan) {
            return response()->json($ruangan);
        } else {
            return response()->json(["message" => "Ruangan not found"], 404);
        }
    }

    public function index($gedungId)
    {
        $rooms = RuanganGKT::where('gedung', $gedungId)->get();
        return response()->json($rooms);
    }

    public function destroy($gedungId, $roomId)
    {
        $room = RuanganGKT::where('gedung', $gedungId)->find($roomId);

        if (!$room) {
            return response()->json(["message" => "Ruangan not found"], 404);
        }

        $room->delete();
        return response()->json(["message" => "Ruangan deleted successfully"], 200);
    }
}
