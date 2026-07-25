<?php

use Livewire\Component;

new class extends Component
{
    public string $role = 'requester';
    public array $requests = [];

    public function mount(): void
    {
        $this->requests = session('requisitions', [
            ['id'=>'REQ-2026-1048','title'=>'Science laboratory supplies','department'=>'Academic Affairs','total'=>1840,'status'=>'Coordinator Review','history'=>['Submitted to Coordinator']],
            ['id'=>'REQ-2026-1044','title'=>'Classroom printer toner','department'=>'Administration','total'=>695,'status'=>'Finance Review','history'=>['Coordinator approved and forwarded to Finance']],
            ['id'=>'REQ-2026-1037','title'=>'Library reading nook furniture','department'=>'Student Services','total'=>3200,'status'=>'Custodian Check','history'=>['Finance initial approval; awaiting availability check']],
            ['id'=>'REQ-2026-1035','title'=>'Network switches','department'=>'Technology','total'=>1260,'status'=>'Final Finance Approval','availability'=>'Unavailable','history'=>['Custodian recorded unavailable stock']],
            ['id'=>'REQ-2026-1031','title'=>'Art classroom supplies','department'=>'Academic Affairs','total'=>460,'status'=>'Partial Release Decision','availability'=>'Partially available','history'=>['Custodian recorded partial availability']],
        ]);
    }

    public function updatedRole(): void { $this->persist(); }
    public function action(string $id, string $action): void
    {
        foreach ($this->requests as &$request) {
            if ($request['id'] !== $id) continue;
            $availability = $request['availability'] ?? '';
            $map = ['coordinator_approve'=>['Finance Review','Coordinator approved and forwarded to Finance'],'finance_initial'=>['Custodian Check','Finance initial approval; sent to Custodian'],'available'=>['Final Finance Approval','Custodian recorded fully available stock'],'partial'=>['Final Finance Approval','Custodian recorded partially available stock'],'unavailable'=>['Final Finance Approval','Custodian recorded unavailable stock'],'finance_final'=>[$availability === 'Unavailable' ? 'Purchasing' : ($availability === 'Partially available' ? 'Partial Release Decision' : 'Ready for Release'),'Finance final approval recorded'],'partial_accept'=>['Ready for Release','Requester accepted partial release'],'partial_hold'=>['Purchasing','Requester asked to hold for all items'],'purchased'=>['Ready for Release','Purchasing marked items available'],'release'=>['Completed','Custodian released items; receipt acknowledged']];
            if (isset($map[$action])) { [$request['status'],$event] = $map[$action]; $request['history'][] = $event; }
        }
        $this->persist();
    }
    private function persist(): void { session(['requisitions'=>$this->requests]); }
    public function queue(): array { $stages=['coordinator'=>['Coordinator Review'],'finance'=>['Finance Review','Final Finance Approval'],'custodian'=>['Custodian Check','Ready for Release'],'purchasing'=>['Purchasing']]; return array_values(array_filter($this->requests,fn($r)=>in_array($r['status'],$stages[$this->role]??[]))); }
};
?>

<div>
  <header class="top"><div><p>REQUISITION SYSTEM</p><h1>Good morning, {{ ucfirst($role) }}</h1></div><label>View as <select wire:model.live="role"><option value="requester">Requester</option><option value="coordinator">Coordinator</option><option value="finance">Finance</option><option value="custodian">Custodian</option><option value="purchasing">Purchasing</option></select></label></header><div class="page">
  <section class="hero"><div><span class="label">{{ strtoupper($role) }} WORKSPACE</span><h2>{{ $role === 'requester' ? 'Get the materials your school needs.' : 'Work waiting for your decision.' }}</h2><p class="muted">One request record follows every approval, availability, purchasing, and release step.</p></div></section>
  <div class="cards"><section class="card"><small>Awaiting my action</small><div class="stat">{{ $role === 'requester' ? count($requests) : count($this->queue()) }}</div></section><section class="card"><small>Completed</small><div class="stat">{{ count(array_filter($requests,fn($r)=>$r['status']==='Completed')) }}</div></section><section class="card"><small>In purchasing</small><div class="stat">{{ count(array_filter($requests,fn($r)=>$r['status']==='Purchasing')) }}</div></section></div>
  <section class="card"><div class="section-head"><div><h2>{{ $role === 'requester' ? 'Recent requisitions' : 'Work needing attention' }}</h2><p class="muted">Open workflow actions are shown below.</p></div></div><table><thead><tr><th>Request</th><th>Department</th><th>Total</th><th>Stage</th><th>Action</th></tr></thead><tbody>@forelse($role === 'requester' ? $requests : $this->queue() as $r)<tr><td><strong>{{ $r['title'] }}</strong><small>{{ $r['id'] }}</small></td><td>{{ $r['department'] }}</td><td>${{ number_format($r['total'],2) }}</td><td><span class="badge">{{ $r['status'] }}</span><small>{{ end($r['history']) }}</small></td><td><div class="actions">@if($role==='coordinator')<button class="primary" wire:click="action('{{ $r['id'] }}','coordinator_approve')">Approve to Finance</button>@elseif($role==='finance' && $r['status']==='Finance Review')<button class="primary" wire:click="action('{{ $r['id'] }}','finance_initial')">Approve to Custodian</button>@elseif($role==='finance')<button class="primary" wire:click="action('{{ $r['id'] }}','finance_final')">Final approve</button>@elseif($role==='custodian' && $r['status']==='Custodian Check')<button wire:click="action('{{ $r['id'] }}','available')">Fully available</button><button wire:click="action('{{ $r['id'] }}','partial')">Partial</button><button class="danger" wire:click="action('{{ $r['id'] }}','unavailable')">Unavailable</button>@elseif($role==='custodian')<button class="primary" wire:click="action('{{ $r['id'] }}','release')">Release</button>@elseif($role==='purchasing')<button class="primary" wire:click="action('{{ $r['id'] }}','purchased')">Mark available</button>@elseif($role==='requester' && $r['status']==='Partial Release Decision')<button class="primary" wire:click="action('{{ $r['id'] }}','partial_accept')">Accept partial</button><button wire:click="action('{{ $r['id'] }}','partial_hold')">Hold for all</button>@endif</div></td></tr>@empty<tr><td colspan="5" class="muted">Nothing needs your action.</td></tr>@endforelse</tbody></table></section></div>
</div>
